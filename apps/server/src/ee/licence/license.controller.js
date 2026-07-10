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
exports.LicenseController = void 0;
const common_1 = require("@nestjs/common");
const license_service_1 = require("./license.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const workspace_ability_type_1 = require("../../core/casl/interfaces/workspace-ability.type");
const workspace_ability_factory_1 = require("../../core/casl/abilities/workspace-ability.factory");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const license_dto_1 = require("./dto/license.dto");
const audit_service_1 = require("../../integrations/audit/audit.service");
const audit_events_1 = require("../../common/events/audit-events");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_keys_1 = require("../../common/helpers/cache-keys");
let LicenseController = class LicenseController {
    constructor(licenseService, workspaceAbility, auditService, cacheManager) {
        this.licenseService = licenseService;
        this.workspaceAbility = workspaceAbility;
        this.auditService = auditService;
        this.cacheManager = cacheManager;
    }
    async getLicense(workspace) {
        return this.licenseService.getLicenseInfo(workspace.licenseKey);
    }
    async activateLicense(user, workspace, dto) {
        await this.validateAccess(user, workspace);
        let previousLicense = null;
        if (workspace.licenseKey) {
            try {
                previousLicense = await this.licenseService.getLicenseInfo(workspace.licenseKey);
            }
            catch {
            }
        }
        const licenseInfo = await this.licenseService.activateLicense(dto.licenseKey, workspace.id);
        await this.cacheManager.del(cache_keys_1.CacheKey.LICENSE_VALID(workspace.id));
        const changes = {
            after: licenseInfo,
        };
        if (previousLicense) {
            changes.before = previousLicense;
        }
        this.auditService.log({
            event: audit_events_1.AuditEvent.LICENSE_ACTIVATED,
            resourceType: audit_events_1.AuditResource.LICENSE,
            resourceId: licenseInfo.id,
            changes,
        });
        return licenseInfo;
    }
    async removeLicense(user, workspace) {
        await this.validateAccess(user, workspace);
        let currentLicense = null;
        if (workspace.licenseKey) {
            try {
                currentLicense = await this.licenseService.getLicenseInfo(workspace.licenseKey);
            }
            catch {
            }
        }
        await this.licenseService.removeLicense(workspace.id);
        await this.cacheManager.del(cache_keys_1.CacheKey.LICENSE_VALID(workspace.id));
        this.auditService.log({
            event: audit_events_1.AuditEvent.LICENSE_REMOVED,
            resourceType: audit_events_1.AuditResource.LICENSE,
            resourceId: currentLicense?.id,
            ...(currentLicense && {
                metadata: {
                    customerName: currentLicense.customerName,
                    seatCount: currentLicense.seatCount,
                    trial: currentLicense.trial,
                    expiresAt: currentLicense.expiresAt,
                },
            }),
        });
    }
    async validateAccess(user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Settings)) {
            throw new common_1.ForbiddenException();
        }
    }
};
exports.LicenseController = LicenseController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('info'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "getLicense", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('activate'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, license_dto_1.ActivateLicenseDto]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "activateLicense", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('remove'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "removeLicense", null);
exports.LicenseController = LicenseController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('license'),
    __param(2, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __param(3, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [license_service_1.LicenseService,
        workspace_ability_factory_1.default, Object, Object])
], LicenseController);
//# sourceMappingURL=license.controller.js.map