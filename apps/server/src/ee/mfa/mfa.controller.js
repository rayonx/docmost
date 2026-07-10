"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaController = void 0;
const common_1 = require("@nestjs/common");
const mfa_service_1 = require("./services/mfa.service");
const mfa_dto_1 = require("./dto/mfa.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const throttler_1 = require("@nestjs/throttler");
const throttler_names_1 = require("../../integrations/throttle/throttler-names");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const helpers_1 = require("../../common/helpers");
const user_repo_1 = require("../../database/repos/user/user.repo");
const mfa_util_1 = require("./mfa.util");
const environment_service_1 = require("../../integrations/environment/environment.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const mfa_auth_service_1 = require("./services/mfa-auth.service");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
const audit_events_1 = require("../../common/events/audit-events");
const audit_service_1 = require("../../integrations/audit/audit.service");
let MfaController = class MfaController {
    constructor(mfaService, userRepo, environmentService, mfaAuthService, auditService) {
        this.mfaService = mfaService;
        this.userRepo = userRepo;
        this.environmentService = environmentService;
        this.mfaAuthService = mfaAuthService;
        this.auditService = auditService;
    }
    async setupMFA(req) {
        const { user, workspace } = await this.mfaAuthService.authenticateRequest(req);
        const isEnabled = await this.mfaService.isMfaEnabled(user.id);
        if (isEnabled) {
            throw new common_1.BadRequestException('MFA is already enabled');
        }
        const { qrCode, manualKey } = await this.mfaService.setupMfa(user.id, workspace.id, user.email, workspace.name);
        return {
            method: mfa_util_1.MfaMethod.TOTP,
            qrCode,
            manualKey,
        };
    }
    async enableMFA(req, res, enableMfaDto) {
        const { user, isTransferToken } = await this.mfaAuthService.authenticateRequest(req);
        const { backupCodes } = await this.mfaService.enableMfa(user.id, enableMfaDto.verificationCode);
        this.auditService.log({
            event: audit_events_1.AuditEvent.USER_MFA_ENABLED,
            resourceType: audit_events_1.AuditResource.USER,
            resourceId: user.id,
        });
        if (isTransferToken) {
            res.clearCookie('mfaToken');
        }
        return {
            backupCodes,
        };
    }
    async disableMFA(user, disableMfaDto) {
        await this.validatePasswordIfRequired(user, disableMfaDto.confirmPassword);
        await this.mfaService.disableMfa(user.id);
        this.auditService.log({
            event: audit_events_1.AuditEvent.USER_MFA_DISABLED,
            resourceType: audit_events_1.AuditResource.USER,
            resourceId: user.id,
        });
    }
    async getMfaStatus(user) {
        const userMfa = await this.mfaService.getUserMfa(user.id, {
            includeBackupCodes: true,
            includeSecret: false,
        });
        return {
            isEnabled: userMfa?.isEnabled || false,
            method: userMfa?.method || null,
            backupCodesCount: userMfa?.backupCodes?.length || 0,
        };
    }
    async regenerateBackupCodes(user, regenerateDto) {
        await this.validatePasswordIfRequired(user, regenerateDto.confirmPassword);
        const { backupCodes } = await this.mfaService.regenerateBackupCodes(user.id);
        this.auditService.log({
            event: audit_events_1.AuditEvent.USER_MFA_BACKUP_CODE_GENERATED,
            resourceType: audit_events_1.AuditResource.USER,
            resourceId: user.id,
        });
        return {
            backupCodes,
        };
    }
    async verifyMFA(verifyMfaDto, req, res, workspace) {
        const { authToken, userId } = await this.mfaService.verifyMfa({
            code: verifyMfaDto.code,
            workspaceId: workspace.id,
            req,
        });
        this.auditService.log({
            event: audit_events_1.AuditEvent.USER_LOGIN,
            resourceType: audit_events_1.AuditResource.USER,
            resourceId: userId,
            metadata: { source: 'mfa' },
        });
        this.setAuthCookie(res, authToken);
        res.clearCookie('mfaToken');
    }
    async validateMfaAccess(req) {
        try {
            const { user, workspace, isTransferToken } = await this.mfaAuthService.authenticateRequest(req);
            const userMfa = await this.mfaService.getUserMfa(user.id);
            const requiresMfaSetup = workspace.enforceMfa && !userMfa?.isEnabled;
            return {
                valid: true,
                isTransferToken,
                requiresMfaSetup,
                userHasMfa: userMfa?.isEnabled || false,
                isMfaEnforced: workspace.enforceMfa || false,
            };
        }
        catch (error) {
            return { valid: false };
        }
    }
    setAuthCookie(res, token) {
        res.setCookie('authToken', token, {
            httpOnly: true,
            path: '/',
            expires: this.environmentService.getCookieExpiresIn(),
            secure: this.environmentService.isHttps(),
        });
    }
    async validatePasswordIfRequired(user, confirmPassword) {
        const currentUser = await this.userRepo.findById(user.id, user.workspaceId, {
            includePassword: true,
        });
        if (currentUser.hasGeneratedPassword) {
            return;
        }
        if (!confirmPassword) {
            throw new common_1.BadRequestException('Password confirmation is required');
        }
        const isPasswordValid = await (0, helpers_1.comparePasswordHash)(confirmPassword, currentUser.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Password does not match');
        }
    }
};
exports.MfaController = MfaController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.MFA),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('setup'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "setupMFA", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.MFA),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('enable'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, mfa_dto_1.EnableMfaDto]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "enableMFA", null);
__decorate([
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.AUTH_THROTTLER]: true }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('disable'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_dto_1.DisableMfaDto]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "disableMFA", null);
__decorate([
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.AUTH_THROTTLER]: true }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('status'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "getMfaStatus", null);
__decorate([
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.AUTH_THROTTLER]: true }),
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.MFA),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('generate-backup-codes'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_dto_1.RegenerateBackupCodesDto]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "regenerateBackupCodes", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.MFA),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __param(3, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mfa_dto_1.MfaDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "verifyMFA", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('validate-access'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "validateMfaAccess", null);
exports.MfaController = MfaController = __decorate([
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.AI_CHAT_THROTTLER]: true }),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard, jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('mfa'),
    __param(4, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [mfa_service_1.MfaService,
        user_repo_1.UserRepo,
        environment_service_1.EnvironmentService,
        mfa_auth_service_1.MfaAuthService, Object])
], MfaController);
//# sourceMappingURL=mfa.controller.js.map