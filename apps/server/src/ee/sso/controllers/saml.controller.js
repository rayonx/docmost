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
exports.SamlController = void 0;
const common_1 = require("@nestjs/common");
const sso_service_1 = require("../services/sso.service");
const saml_auth_guard_1 = require("../guards/saml-auth.guard");
const node_saml_1 = require("@node-saml/node-saml");
const constants_1 = require("../constants");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const saml_service_1 = require("../services/saml.service");
const skip_transform_decorator_1 = require("../../../common/decorators/skip-transform.decorator");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
let SamlController = class SamlController {
    constructor(samlService, ssoService) {
        this.samlService = samlService;
        this.ssoService = ssoService;
    }
    async samlLogin() { }
    async callback(workspace, req, res) {
        const providerId = req.params?.['providerId'];
        if (!providerId) {
            throw new common_1.BadRequestException('ProviderId is required');
        }
        const authToken = await this.samlService.handleCallback({
            req,
            workspace,
            providerId,
        });
        this.ssoService.setCookieAndRedirect(res, authToken, req);
    }
    async getMetadata(req, workspace) {
        const providerId = req.params?.['providerId'];
        if (!providerId) {
            throw new common_1.BadRequestException('providerId is required');
        }
        try {
            const issuer = this.ssoService.buildSamlIssuer({
                hostname: workspace.hostname,
                providerId,
            });
            const metadata = (0, node_saml_1.generateServiceProviderMetadata)({
                issuer: issuer,
                callbackUrl: this.ssoService.buildCallbackUrl({
                    providerId: providerId,
                    type: constants_1.SSO_PROVIDER.SAML,
                    hostname: workspace.hostname,
                }),
            });
            return metadata.toString();
        }
        catch (err) {
            throw new common_1.BadRequestException('Failed to generate SAML metadata');
        }
    }
};
exports.SamlController = SamlController;
__decorate([
    (0, common_1.Get)(':providerId/login'),
    (0, common_1.UseGuards)(saml_auth_guard_1.SamlAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SamlController.prototype, "samlLogin", null);
__decorate([
    (0, common_1.Post)(':providerId/callback'),
    (0, common_1.UseGuards)(saml_auth_guard_1.SamlAuthGuard),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SamlController.prototype, "callback", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)(':providerId/metadata'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SamlController.prototype, "getMetadata", null);
exports.SamlController = SamlController = __decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SSO_CUSTOM),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.Controller)('sso/saml'),
    __metadata("design:paramtypes", [saml_service_1.SamlService,
        sso_service_1.SsoService])
], SamlController);
//# sourceMappingURL=saml.controller.js.map