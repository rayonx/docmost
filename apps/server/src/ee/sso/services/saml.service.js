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
var SamlService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SamlService = void 0;
const common_1 = require("@nestjs/common");
const sso_service_1 = require("./sso.service");
const session_service_1 = require("../../../core/session/session.service");
const constants_1 = require("../constants");
const nestjs_ioredis_1 = require("@nestjs-labs/nestjs-ioredis");
const crypto = require("crypto");
const SAML_RESPONSE_TTL_SECONDS = 7200;
const SAML_RESPONSE_KEY_PREFIX = 'saml:resp:';
let SamlService = SamlService_1 = class SamlService {
    constructor(ssoService, sessionService, redisService) {
        this.ssoService = ssoService;
        this.sessionService = sessionService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(SamlService_1.name);
    }
    async handleCallback(opts) {
        const { req, workspace, providerId } = opts;
        const profile = req?.['user'];
        await this.rejectReplayedResponse(req);
        const user = await this.ssoService.handleAuthentication({
            workspace,
            profile,
            providerId,
            providerType: constants_1.SSO_PROVIDER.SAML,
        });
        return this.sessionService.createSessionAndToken(user);
    }
    async rejectReplayedResponse(req) {
        const samlResponse = req.body?.SAMLResponse;
        if (!samlResponse) {
            throw new common_1.BadRequestException('The SAML request payload is missing');
        }
        const responseHash = crypto
            .createHash('sha256')
            .update(samlResponse)
            .digest('hex');
        const redis = this.redisService.getOrThrow();
        const redisKey = SAML_RESPONSE_KEY_PREFIX + responseHash;
        const isNew = await redis.set(redisKey, '1', 'EX', SAML_RESPONSE_TTL_SECONDS, 'NX');
        if (!isNew) {
            this.logger.debug(`[SAML Replay] Rejected replayed response (hash: ${responseHash.slice(0, 12)})`);
            throw new common_1.BadRequestException('SAML response has already been used. Please try again.');
        }
    }
};
exports.SamlService = SamlService;
exports.SamlService = SamlService = SamlService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sso_service_1.SsoService,
        session_service_1.SessionService,
        nestjs_ioredis_1.RedisService])
], SamlService);
//# sourceMappingURL=saml.service.js.map