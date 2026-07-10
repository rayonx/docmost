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
exports.SamlAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const sso_service_1 = require("../services/sso.service");
let SamlAuthGuard = class SamlAuthGuard extends (0, passport_1.AuthGuard)('saml') {
    constructor(ssoService) {
        super();
        this.ssoService = ssoService;
        this.logger = new common_1.Logger();
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const method = request.method?.toUpperCase?.();
        if (method === 'GET') {
            this.ssoService.setSsoRedirectCookie(response, request.query?.redirect);
        }
        return super.canActivate(context);
    }
    handleRequest(err, user) {
        if (err || !user) {
            if (err) {
                this.logger.error({ err }, 'SAML authentication failed');
            }
            const message = err instanceof common_1.BadRequestException
                ? err.message
                : this.toUserMessage(err?.message);
            throw new common_1.BadRequestException(message);
        }
        return user;
    }
    toUserMessage(message) {
        if (message?.includes('InResponseTo')) {
            return 'SAML authentication failed. Please try signing in again.';
        }
        return message || 'SAML authentication failed';
    }
};
exports.SamlAuthGuard = SamlAuthGuard;
exports.SamlAuthGuard = SamlAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sso_service_1.SsoService])
], SamlAuthGuard);
//# sourceMappingURL=saml-auth.guard.js.map