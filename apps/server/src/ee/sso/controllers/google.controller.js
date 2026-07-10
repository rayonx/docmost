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
exports.GoogleController = void 0;
const common_1 = require("@nestjs/common");
const google_auth_guard_1 = require("../guards/google-auth.guard");
const domain_service_1 = require("../../../integrations/environment/domain.service");
const google_sso_service_1 = require("../services/google-sso.service");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const sso_service_1 = require("../services/sso.service");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
const cloud_access_guard_1 = require("../../guards/cloud-access.guard");
const sso_constants_1 = require("../sso.constants");
const sso_utils_1 = require("../sso.utils");
let GoogleController = class GoogleController {
    constructor(googleSsoService, domainService, environmentService, ssoService) {
        this.googleSsoService = googleSsoService;
        this.domainService = domainService;
        this.environmentService = environmentService;
        this.ssoService = ssoService;
    }
    async googleLogin() { }
    async googleSignup() { }
    async callback(req, res) {
        const { workspace, authToken, exchangeToken } = await this.googleSsoService.handleCallback(req, res);
        const workspaceDomain = this.domainService.getUrl(workspace.hostname);
        if (this.environmentService.isCloud()) {
            const cookieRedirect = req.cookies?.[sso_constants_1.SSO_REDIRECT_COOKIE];
            res.clearCookie(sso_constants_1.SSO_REDIRECT_COOKIE, { path: '/' });
            const safe = (0, sso_utils_1.safeRedirectPath)(cookieRedirect);
            let redirectUrl = workspaceDomain + '/api/auth/exchange?token=' + exchangeToken;
            if (safe) {
                redirectUrl += '&redirect=' + encodeURIComponent(safe);
            }
            res.redirect(redirectUrl, common_1.HttpStatus.PERMANENT_REDIRECT).send();
        }
        this.ssoService.setCookieAndRedirect(res, authToken, req);
    }
};
exports.GoogleController = GoogleController;
__decorate([
    (0, common_1.Get)('/login'),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard, google_auth_guard_1.GoogleAuthGuard),
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SSO_GOOGLE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)('/signup'),
    (0, common_1.UseGuards)(cloud_access_guard_1.CloudAccessGuard, google_auth_guard_1.GoogleAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "googleSignup", null);
__decorate([
    (0, common_1.Get)('/callback'),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard, google_auth_guard_1.GoogleAuthGuard),
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SSO_GOOGLE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "callback", null);
exports.GoogleController = GoogleController = __decorate([
    (0, common_1.Controller)('sso/google'),
    __metadata("design:paramtypes", [google_sso_service_1.GoogleSsoService,
        domain_service_1.DomainService,
        environment_service_1.EnvironmentService,
        sso_service_1.SsoService])
], GoogleController);
//# sourceMappingURL=google.controller.js.map