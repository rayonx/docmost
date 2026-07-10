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
var SamlStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SamlStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_saml_1 = require("@node-saml/passport-saml");
const sso_service_1 = require("../services/sso.service");
const constants_1 = require("../constants");
const sso_utils_1 = require("../sso.utils");
const environment_service_1 = require("../../../integrations/environment/environment.service");
let SamlStrategy = SamlStrategy_1 = class SamlStrategy extends (0, passport_1.PassportStrategy)(passport_saml_1.MultiSamlStrategy, 'saml') {
    constructor(ssoService, environmentService) {
        super({
            async getSamlOptions(req, done) {
                const providerId = req.params?.['providerId'];
                const workspace = req.raw?.['workspace'];
                if (!workspace) {
                    return done(new common_1.NotFoundException('SAML error. Workspace not found'), null);
                }
                if (!providerId) {
                    return done(new common_1.BadRequestException('ProviderId is required'), null);
                }
                let provider;
                try {
                    provider = await ssoService.getProviderById({
                        providerId,
                        workspaceId: workspace.id,
                        type: constants_1.SSO_PROVIDER.SAML,
                    });
                }
                catch (err) {
                    this.logger.error({ err }, 'Failed to fetch SAML provider');
                    return done(new common_1.BadRequestException('Failed to fetch SAML provider'), null);
                }
                if (!provider) {
                    return done(new common_1.NotFoundException('SAML provider not found'), null);
                }
                if (!provider.isEnabled) {
                    return done(new common_1.BadRequestException('SAML provider is not enabled'), null);
                }
                const callbackUrl = ssoService.buildCallbackUrl({
                    hostname: workspace.hostname,
                    type: constants_1.SSO_PROVIDER.SAML,
                    providerId,
                });
                const issuer = ssoService.buildSamlIssuer({
                    hostname: workspace.hostname,
                    providerId,
                });
                const samlConfig = {
                    entryPoint: provider.samlUrl?.trim(),
                    idpCert: provider.samlCertificate?.trim(),
                    issuer: issuer,
                    callbackUrl: callbackUrl,
                    signatureAlgorithm: 'sha256',
                    disableRequestedAuthnContext: environmentService.getSamlDisableRequestedAuthnContext(),
                    wantAssertionsSigned: false,
                    wantAuthnResponseSigned: false,
                };
                return done(null, samlConfig);
            },
            passReqToCallback: true,
        });
        this.logger = new common_1.Logger(SamlStrategy_1.name);
    }
    async validate(req, profile, done) {
        const providerId = req.params?.['providerId'];
        if (!providerId) {
            throw new common_1.BadRequestException('SAML callback error. ProviderId is missing.');
        }
        const samlProfile = (0, sso_utils_1.formatSamlProfile)(profile, providerId);
        if (!samlProfile.email) {
            throw new common_1.BadRequestException('SAML account email is missing');
        }
        if (!samlProfile.nameId) {
            throw new common_1.BadRequestException('SAML account nameId is missing');
        }
        done(null, samlProfile);
    }
};
exports.SamlStrategy = SamlStrategy;
exports.SamlStrategy = SamlStrategy = SamlStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sso_service_1.SsoService, environment_service_1.EnvironmentService])
], SamlStrategy);
//# sourceMappingURL=saml.strategy.js.map