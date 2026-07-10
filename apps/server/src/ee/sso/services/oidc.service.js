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
var OidcService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OidcService = void 0;
const common_1 = require("@nestjs/common");
const sso_service_1 = require("./sso.service");
const constants_1 = require("../constants");
const openid_client_1 = require("openid-client");
const proxy_fetch_1 = require("../../common/proxy-fetch");
const date_fns_1 = require("date-fns");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const sso_utils_1 = require("../sso.utils");
const session_service_1 = require("../../../core/session/session.service");
let OidcService = OidcService_1 = class OidcService {
    constructor(ssoService, environmentService, sessionService) {
        this.ssoService = ssoService;
        this.environmentService = environmentService;
        this.sessionService = sessionService;
        this.logger = new common_1.Logger(OidcService_1.name);
    }
    async handleCallback(opts) {
        const { workspace, providerId } = opts;
        const profile = await this.validate(opts);
        let user;
        try {
            user = await this.ssoService.handleAuthentication({
                workspace,
                profile,
                providerId,
                providerType: constants_1.SSO_PROVIDER.OIDC,
            });
        }
        catch (err) {
            throw err;
        }
        return this.sessionService.createSessionAndToken(user);
    }
    async validate(opts) {
        const { req, res, workspace, providerId } = opts;
        const stateCookieKey = `oidc:${providerId}`;
        const stateCookie = req.cookies[stateCookieKey];
        if (!stateCookie) {
            throw new common_1.BadRequestException('OIDC error. Unable to verify authentication request state.');
        }
        try {
            const config = await this.getClient({
                providerId: providerId,
                workspace: workspace,
            });
            const callbackUrl = this.ssoService.buildCallbackUrl({
                providerId: providerId,
                hostname: workspace.hostname,
                type: constants_1.SSO_PROVIDER.OIDC,
            });
            const currentUrl = new URL(req.url, callbackUrl);
            const tokenResponse = await (0, openid_client_1.authorizationCodeGrant)(config, currentUrl, {
                expectedState: stateCookie,
            });
            const claims = tokenResponse.claims();
            this.logger.debug({ claims }, 'auth claims');
            let userInfo = await (0, openid_client_1.fetchUserInfo)(config, tokenResponse.access_token, claims?.sub ?? openid_client_1.skipSubjectCheck);
            this.logger.debug({ userInfo }, 'auth userInfo');
            if (!userInfo) {
                throw new common_1.BadRequestException('Unable to fetch user details from identity provider.');
            }
            if (!userInfo?.email && claims?.email) {
                userInfo = {
                    ...userInfo,
                    email: claims.email,
                };
                this.logger.debug({ email: claims.email }, 'Email extracted from token claims');
            }
            if (!userInfo?.groups && claims?.groups) {
                userInfo = { ...userInfo, groups: claims.groups };
            }
            if (!userInfo?.roles && claims?.roles) {
                userInfo = { ...userInfo, roles: claims.roles };
            }
            if (!userInfo?.email) {
                throw new common_1.BadRequestException('OIDC email not returned.');
            }
            res.clearCookie(stateCookieKey);
            return (0, sso_utils_1.formatOidcProfile)(userInfo);
        }
        catch (err) {
            this.logger.error({ err }, 'OIDC authentication failed');
            throw new common_1.BadRequestException(`OIDC authentication failed: ${err?.['error']}`);
        }
    }
    async getAuthorizationUrl(opts) {
        const { res, providerId, workspace } = opts;
        try {
            const state = (0, openid_client_1.randomState)();
            const config = await this.getClient({
                providerId: providerId,
                workspace: workspace,
            });
            const callbackUrl = this.ssoService.buildCallbackUrl({
                providerId: providerId,
                hostname: workspace.hostname,
                type: constants_1.SSO_PROVIDER.OIDC,
            });
            const redirectUrl = (0, openid_client_1.buildAuthorizationUrl)(config, {
                redirect_uri: callbackUrl,
                scope: 'openid email profile',
                state: state,
            });
            const stateCookieKey = `oidc:${providerId}`;
            res.setCookie(stateCookieKey, state, {
                httpOnly: true,
                path: '/',
                secure: this.environmentService.isHttps(),
                sameSite: 'lax',
                expires: (0, date_fns_1.addMinutes)(new Date(), 5),
            });
            return redirectUrl.href;
        }
        catch (err) {
            this.logger.error({ err }, 'OIDC authorization URL build failed');
            throw new common_1.BadRequestException(err);
        }
    }
    async getClient(opts) {
        const { providerId, workspace } = opts;
        const provider = await this.ssoService.getProviderById({
            providerId: providerId,
            workspaceId: workspace.id,
            type: constants_1.SSO_PROVIDER.OIDC,
        });
        if (!provider) {
            throw new common_1.BadRequestException('OIDC provider not found.');
        }
        const callbackUrl = this.ssoService.buildCallbackUrl({
            providerId: provider.id,
            hostname: workspace.hostname,
            type: constants_1.SSO_PROVIDER.OIDC,
        });
        try {
            const proxyFetch = (0, proxy_fetch_1.getProxyAwareFetch)();
            const config = await (0, openid_client_1.discovery)(new URL(provider.oidcIssuer), provider.oidcClientId?.trim(), {
                client_secret: provider.oidcClientSecret?.trim(),
                redirect_uris: [callbackUrl],
                response_types: ['code'],
            }, undefined, {
                execute: [openid_client_1.allowInsecureRequests],
                ...(proxyFetch && { [openid_client_1.customFetch]: proxyFetch }),
            });
            if (proxyFetch) {
                config[openid_client_1.customFetch] = proxyFetch;
            }
            return config;
        }
        catch (err) {
            this.logger.error({ err }, `OIDC Issuer resolver error for ${provider?.oidcIssuer}`);
            throw new common_1.BadRequestException('Failed to resolve OIDC issuer.');
        }
    }
};
exports.OidcService = OidcService;
exports.OidcService = OidcService = OidcService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sso_service_1.SsoService,
        environment_service_1.EnvironmentService,
        session_service_1.SessionService])
], OidcService);
//# sourceMappingURL=oidc.service.js.map