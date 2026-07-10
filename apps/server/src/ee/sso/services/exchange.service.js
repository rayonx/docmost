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
var ExchangeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeService = void 0;
const common_1 = require("@nestjs/common");
const token_service_1 = require("../../../core/auth/services/token.service");
const session_service_1 = require("../../../core/session/session.service");
const user_repo_1 = require("../../../database/repos/user/user.repo");
const nestjs_kysely_1 = require("nestjs-kysely");
const jwt_payload_1 = require("../../../core/auth/dto/jwt-payload");
let ExchangeService = ExchangeService_1 = class ExchangeService {
    constructor(tokenService, sessionService, userRepo, db) {
        this.tokenService = tokenService;
        this.sessionService = sessionService;
        this.userRepo = userRepo;
        this.db = db;
        this.logger = new common_1.Logger(ExchangeService_1.name);
    }
    async handleExchangeToken(jwtExchangeToken, workspaceId) {
        let jwtExchangePayload;
        try {
            jwtExchangePayload = await this.tokenService.verifyJwt(jwtExchangeToken, jwt_payload_1.JwtType.EXCHANGE);
        }
        catch (err) {
            this.logger.warn('Invalid exchange token');
            throw new common_1.UnauthorizedException('Invalid exchange token');
        }
        if (jwtExchangePayload.workspaceId !== workspaceId) {
            throw new common_1.UnauthorizedException();
        }
        const user = await this.userRepo.findById(jwtExchangePayload.sub, jwtExchangePayload.workspaceId);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        await this.userRepo.updateLastLogin(user.id, workspaceId);
        return this.sessionService.createSessionAndToken(user);
    }
};
exports.ExchangeService = ExchangeService;
exports.ExchangeService = ExchangeService = ExchangeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        session_service_1.SessionService,
        user_repo_1.UserRepo, Object])
], ExchangeService);
//# sourceMappingURL=exchange.service.js.map