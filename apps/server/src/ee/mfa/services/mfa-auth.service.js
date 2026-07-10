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
exports.MfaAuthService = void 0;
const common_1 = require("@nestjs/common");
const token_service_1 = require("../../../core/auth/services/token.service");
const user_repo_1 = require("../../../database/repos/user/user.repo");
const workspace_repo_1 = require("../../../database/repos/workspace/workspace.repo");
const jwt_payload_1 = require("../../../core/auth/dto/jwt-payload");
const helpers_1 = require("../../../common/helpers");
let MfaAuthService = class MfaAuthService {
    constructor(tokenService, userRepo, workspaceRepo) {
        this.tokenService = tokenService;
        this.userRepo = userRepo;
        this.workspaceRepo = workspaceRepo;
    }
    async authenticateRequest(req) {
        const requestWorkspaceId = req.raw?.workspaceId;
        const authToken = req.cookies?.authToken || (0, helpers_1.extractBearerTokenFromHeader)(req);
        if (authToken) {
            try {
                const payload = (await this.tokenService.verifyJwt(authToken, jwt_payload_1.JwtType.ACCESS));
                if (!payload.workspaceId || payload.type !== jwt_payload_1.JwtType.ACCESS) {
                    throw new common_1.UnauthorizedException('Invalid token type');
                }
                const { user, workspace } = await this.validatePayloadAndGetUserWorkspace(payload, requestWorkspaceId);
                return { user, workspace, isTransferToken: false };
            }
            catch (error) {
                throw new common_1.UnauthorizedException();
            }
        }
        const mfaToken = req.cookies?.mfaToken;
        if (!mfaToken) {
            throw new common_1.UnauthorizedException('Authentication required');
        }
        try {
            const payload = (await this.tokenService.verifyJwt(mfaToken, jwt_payload_1.JwtType.MFA_TOKEN));
            const { user, workspace } = await this.validatePayloadAndGetUserWorkspace(payload, requestWorkspaceId);
            return { user, workspace, isTransferToken: true };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired MFA transfer token');
        }
    }
    async validatePayloadAndGetUserWorkspace(payload, requestWorkspaceId) {
        if (requestWorkspaceId && requestWorkspaceId !== payload.workspaceId) {
            throw new common_1.UnauthorizedException('Workspace does not match');
        }
        const workspace = await this.workspaceRepo.findById(payload.workspaceId);
        if (!workspace) {
            throw new common_1.UnauthorizedException();
        }
        const user = await this.userRepo.findById(payload.sub, payload.workspaceId);
        if (!user || (0, helpers_1.isUserDisabled)(user)) {
            throw new common_1.UnauthorizedException();
        }
        return { user, workspace };
    }
};
exports.MfaAuthService = MfaAuthService;
exports.MfaAuthService = MfaAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        user_repo_1.UserRepo,
        workspace_repo_1.WorkspaceRepo])
], MfaAuthService);
//# sourceMappingURL=mfa-auth.service.js.map