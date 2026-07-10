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
exports.ApiKeyController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const api_key_service_1 = require("./api-key.service");
const api_key_dto_1 = require("./dto/api-key.dto");
const workspace_ability_factory_1 = require("../../core/casl/abilities/workspace-ability.factory");
const workspace_ability_type_1 = require("../../core/casl/interfaces/workspace-ability.type");
const pagination_options_1 = require("../../database/pagination/pagination-options");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
let ApiKeyController = class ApiKeyController {
    constructor(apiKeyService, workspaceAbility) {
        this.apiKeyService = apiKeyService;
        this.workspaceAbility = workspaceAbility;
    }
    async getApiKeys(pagination, user, workspace) {
        if (pagination.adminView) {
            const ability = this.workspaceAbility.createForUser(user, workspace);
            if (ability.can(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.API)) {
                return this.apiKeyService.getApiKeys({
                    workspaceId: workspace.id,
                    pagination,
                });
            }
        }
        return this.apiKeyService.getApiKeys({
            userId: user.id,
            workspaceId: workspace.id,
            pagination,
        });
    }
    async createApiKey(dto, user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (workspace?.settings?.['api']?.['restrictToAdmins'] === true) {
            if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.API)) {
                throw new common_1.ForbiddenException('Only admins can create API keys in this workspace');
            }
        }
        else {
            if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Create, workspace_ability_type_1.WorkspaceCaslSubject.API)) {
                throw new common_1.ForbiddenException();
            }
        }
        return this.apiKeyService.createApiKey(user, workspace.id, dto);
    }
    async updateApiKey(dto, user, workspace) {
        const apiKey = await this.apiKeyService.findById(dto.apiKeyId);
        if (!apiKey || apiKey.workspaceId !== workspace.id) {
            throw new common_1.ForbiddenException();
        }
        if (apiKey.creatorId === user.id) {
            return this.apiKeyService.updateApiKey(dto.apiKeyId, dto.name);
        }
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.can(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.API)) {
            return this.apiKeyService.updateApiKey(dto.apiKeyId, dto.name);
        }
        else {
            throw new common_1.ForbiddenException();
        }
    }
    async revokeApiKey(dto, user, workspace) {
        const apiKey = await this.apiKeyService.findById(dto.apiKeyId);
        if (!apiKey || apiKey.workspaceId !== workspace.id) {
            throw new common_1.ForbiddenException();
        }
        if (apiKey.creatorId === user.id) {
            await this.apiKeyService.revokeApiKey(dto.apiKeyId);
            return;
        }
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.can(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.API)) {
            await this.apiKeyService.revokeApiKey(dto.apiKeyId);
        }
        else {
            throw new common_1.ForbiddenException();
        }
    }
};
exports.ApiKeyController = ApiKeyController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_options_1.PaginationOptions, Object, Object]),
    __metadata("design:returntype", Promise)
], ApiKeyController.prototype, "getApiKeys", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.API_KEYS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [api_key_dto_1.CreateApiKeyDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ApiKeyController.prototype, "createApiKey", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.API_KEYS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [api_key_dto_1.UpdateApiKeyDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ApiKeyController.prototype, "updateApiKey", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('revoke'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [api_key_dto_1.RevokeApiKeyDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ApiKeyController.prototype, "revokeApiKey", null);
exports.ApiKeyController = ApiKeyController = __decorate([
    (0, common_1.Controller)('api-keys'),
    __metadata("design:paramtypes", [api_key_service_1.ApiKeyService,
        workspace_ability_factory_1.default])
], ApiKeyController);
//# sourceMappingURL=api-key.controller.js.map