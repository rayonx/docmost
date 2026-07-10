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
exports.ScimTokenController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
const auth_user_decorator_1 = require("../../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const scim_token_service_1 = require("../services/scim-token.service");
const scim_token_dto_1 = require("../dto/scim-token.dto");
const workspace_ability_factory_1 = require("../../../core/casl/abilities/workspace-ability.factory");
const workspace_ability_type_1 = require("../../../core/casl/interfaces/workspace-ability.type");
const pagination_options_1 = require("../../../database/pagination/pagination-options");
let ScimTokenController = class ScimTokenController {
    constructor(scimTokenService, workspaceAbility) {
        this.scimTokenService = scimTokenService;
        this.workspaceAbility = workspaceAbility;
    }
    async getTokens(pagination, user, workspace) {
        this.assertManageSettings(user, workspace);
        return this.scimTokenService.getTokens({
            workspaceId: workspace.id,
            pagination,
        });
    }
    async createToken(dto, user, workspace) {
        this.assertManageSettings(user, workspace);
        const { token, scimToken } = await this.scimTokenService.createToken(user, workspace.id, dto.name);
        return {
            token,
            id: scimToken.id,
            name: scimToken.name,
            tokenLastFour: scimToken.tokenLastFour,
            isEnabled: scimToken.isEnabled,
            createdAt: scimToken.createdAt,
        };
    }
    async revokeToken(dto, user, workspace) {
        this.assertManageSettings(user, workspace);
        const token = await this.scimTokenService.findById(dto.tokenId, workspace.id);
        if (!token) {
            throw new common_1.ForbiddenException('Token not found');
        }
        await this.scimTokenService.revokeToken(dto.tokenId, workspace.id);
    }
    assertManageSettings(user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Settings)) {
            throw new common_1.ForbiddenException();
        }
    }
};
exports.ScimTokenController = ScimTokenController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_options_1.PaginationOptions, Object, Object]),
    __metadata("design:returntype", Promise)
], ScimTokenController.prototype, "getTokens", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scim_token_dto_1.CreateScimTokenDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ScimTokenController.prototype, "createToken", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('revoke'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scim_token_dto_1.RevokeScimTokenDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ScimTokenController.prototype, "revokeToken", null);
exports.ScimTokenController = ScimTokenController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SCIM),
    (0, common_1.Controller)('scim-tokens'),
    __metadata("design:paramtypes", [scim_token_service_1.ScimTokenService,
        workspace_ability_factory_1.default])
], ScimTokenController);
//# sourceMappingURL=scim-token.controller.js.map