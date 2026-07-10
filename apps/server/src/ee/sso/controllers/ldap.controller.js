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
exports.LdapController = void 0;
const common_1 = require("@nestjs/common");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const ldap_service_1 = require("../services/ldap.service");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
const ldap_login_dto_1 = require("../dto/ldap-login.dto");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const mfa_service_1 = require("../../mfa/services/mfa.service");
let LdapController = class LdapController {
    constructor(ldapService, environmentService, mfaService) {
        this.ldapService = ldapService;
        this.environmentService = environmentService;
        this.mfaService = mfaService;
    }
    async ldapLogin(workspace, dto, req, res) {
        const providerId = req.params?.['providerId'];
        if (!providerId) {
            throw new common_1.BadRequestException('ProviderId is required');
        }
        const user = await this.ldapService.authenticate({
            username: dto.username,
            password: dto.password,
            workspace,
            providerId,
        });
        const mfaResult = await this.mfaService.checkMfaRequirements(user, workspace, res, true);
        if (mfaResult.userHasMfa || mfaResult.requiresMfaSetup) {
            return {
                userHasMfa: mfaResult.userHasMfa,
                requiresMfaSetup: mfaResult.requiresMfaSetup,
                isMfaEnforced: mfaResult.isMfaEnforced,
            };
        }
        this.setAuthCookie(res, mfaResult.authToken);
        return;
    }
    setAuthCookie(res, token) {
        res.setCookie('authToken', token, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            expires: this.environmentService.getCookieExpiresIn(),
            secure: this.environmentService.isHttps(),
        });
    }
};
exports.LdapController = LdapController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(':providerId/login'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ldap_login_dto_1.LdapLoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], LdapController.prototype, "ldapLogin", null);
exports.LdapController = LdapController = __decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SSO_CUSTOM),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.Controller)('sso/ldap'),
    __metadata("design:paramtypes", [ldap_service_1.LdapService,
        environment_service_1.EnvironmentService,
        mfa_service_1.MfaService])
], LdapController);
//# sourceMappingURL=ldap.controller.js.map