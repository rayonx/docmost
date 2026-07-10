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
exports.OidcController = void 0;
const common_1 = require("@nestjs/common");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const oidc_service_1 = require("../services/oidc.service");
const sso_service_1 = require("../services/sso.service");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
let OidcController = class OidcController {
    constructor(oidcService, ssoService) {
        this.oidcService = oidcService;
        this.ssoService = ssoService;
    }
    async oidcLogin(workspace, req, res) {
        const providerId = req.params?.['providerId'];
        if (!providerId) {
            throw new common_1.BadRequestException('ProviderId is required');
        }
        this.ssoService.setSsoRedirectCookie(res, req.query?.redirect);
        const redirectUrl = await this.oidcService.getAuthorizationUrl({
            res,
            providerId,
            workspace,
        });
        res.redirect(redirectUrl, common_1.HttpStatus.TEMPORARY_REDIRECT).send();
    }
    async callback(workspace, req, res) {
        const providerId = req.params?.['providerId'];
        if (!providerId) {
            throw new common_1.BadRequestException('ProviderId is required');
        }
        const authToken = await this.oidcService.handleCallback({
            req,
            res,
            workspace,
            providerId,
        });
        this.ssoService.setCookieAndRedirect(res, authToken, req);
    }
};
exports.OidcController = OidcController;
__decorate([
    (0, common_1.Get)(':providerId/login'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OidcController.prototype, "oidcLogin", null);
__decorate([
    (0, common_1.Get)(':providerId/callback'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OidcController.prototype, "callback", null);
exports.OidcController = OidcController = __decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SSO_CUSTOM),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.Controller)('sso/oidc'),
    __metadata("design:paramtypes", [oidc_service_1.OidcService,
        sso_service_1.SsoService])
], OidcController);
//# sourceMappingURL=oidc.controller.js.map