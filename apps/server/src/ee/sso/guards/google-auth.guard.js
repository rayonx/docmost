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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const date_fns_1 = require("date-fns");
const openid_client_1 = require("openid-client");
const sso_constants_1 = require("../sso.constants");
const sso_service_1 = require("../services/sso.service");
let GoogleAuthGuard = class GoogleAuthGuard extends (0, passport_1.AuthGuard)('google') {
    constructor(environmentService, ssoService) {
        super({
            accessType: 'offline',
            prompt: 'select_account',
        });
        this.environmentService = environmentService;
        this.ssoService = ssoService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { query, originalUrl } = request;
        const path = originalUrl.split('?')[0];
        const signInPaths = [sso_constants_1.GOOGLE_LOGIN_PATH, sso_constants_1.GOOGLE_SIGNUP_PATH];
        if (!signInPaths.includes(path)) {
            return super.canActivate(context);
        }
        const state = (0, openid_client_1.randomState)();
        let stateCookieValue = null;
        if (path === sso_constants_1.GOOGLE_LOGIN_PATH) {
            let workspaceId = query?.workspaceId;
            if (!this.environmentService.isCloud()) {
                workspaceId = request?.raw?.workspace?.id;
            }
            if (!workspaceId) {
                throw new common_1.BadRequestException('workspaceId param is missing');
            }
            stateCookieValue = `${state},${workspaceId}`;
            this.ssoService.setSsoRedirectCookie(response, query?.redirect);
        }
        if (path === sso_constants_1.GOOGLE_SIGNUP_PATH) {
            stateCookieValue = `${state},signup`;
        }
        const cookieOptions = {
            httpOnly: true,
            secure: this.environmentService.isHttps(),
            path: '/',
            sameSite: 'lax',
            expires: (0, date_fns_1.addMinutes)(new Date(), 5),
        };
        response.setCookie(sso_constants_1.GOOGLE_SSO_STATE_KEY, stateCookieValue, cookieOptions);
        request.googleLoginState = state;
        return super.canActivate(context);
    }
    handleRequest(err, user, info, context, status) {
        if (err || !user) {
            if (err?.name === 'TokenError') {
                throw new common_1.BadRequestException('Invalid authorization code');
            }
            throw err || new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.GoogleAuthGuard = GoogleAuthGuard;
exports.GoogleAuthGuard = GoogleAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService,
        sso_service_1.SsoService])
], GoogleAuthGuard);
//# sourceMappingURL=google-auth.guard.js.map