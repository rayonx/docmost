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
exports.TemplateController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const template_service_1 = require("./services/template.service");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const create_template_dto_1 = require("./dto/create-template.dto");
const update_template_dto_1 = require("./dto/update-template.dto");
const template_id_dto_1 = require("./dto/template-id.dto");
const use_template_dto_1 = require("./dto/use-template.dto");
const template_list_dto_1 = require("./dto/template-list.dto");
const pagination_options_1 = require("../../database/pagination/pagination-options");
const workspace_ability_factory_1 = require("../../core/casl/abilities/workspace-ability.factory");
const workspace_ability_type_1 = require("../../core/casl/interfaces/workspace-ability.type");
const space_ability_factory_1 = require("../../core/casl/abilities/space-ability.factory");
const space_ability_type_1 = require("../../core/casl/interfaces/space-ability.type");
const space_member_repo_1 = require("../../database/repos/space/space-member.repo");
const template_repo_1 = require("../../database/repos/template/template.repo");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
let TemplateController = class TemplateController {
    constructor(templateService, templateRepo, spaceMemberRepo, workspaceAbility, spaceAbility) {
        this.templateService = templateService;
        this.templateRepo = templateRepo;
        this.spaceMemberRepo = spaceMemberRepo;
        this.workspaceAbility = workspaceAbility;
        this.spaceAbility = spaceAbility;
    }
    async getTemplates(dto, pagination, user, workspace) {
        return this.templateService.getTemplates(user.id, workspace.id, pagination, dto.spaceId);
    }
    async getTemplate(dto, user, workspace) {
        const template = await this.templateService.getTemplateById(dto.templateId, workspace.id);
        await this.validateTemplateReadAccess(user.id, template.spaceId);
        return template;
    }
    async createTemplate(dto, user, workspace) {
        await this.validateTemplateWriteAccess(user, workspace, dto.spaceId);
        return this.templateService.createTemplate(user.id, workspace.id, dto);
    }
    async updateTemplate(dto, user, workspace) {
        const template = await this.templateRepo.findById(dto.templateId, workspace.id);
        if (!template) {
            throw new common_1.ForbiddenException();
        }
        await this.validateTemplateWriteAccess(user, workspace, template.spaceId);
        if (dto.spaceId !== undefined && dto.spaceId !== template.spaceId) {
            await this.validateTemplateWriteAccess(user, workspace, dto.spaceId ?? null);
        }
        return this.templateService.updateTemplate(user.id, workspace.id, dto);
    }
    async deleteTemplate(dto, user, workspace) {
        const template = await this.templateRepo.findById(dto.templateId, workspace.id);
        if (!template) {
            throw new common_1.ForbiddenException();
        }
        await this.validateTemplateWriteAccess(user, workspace, template.spaceId);
        return this.templateService.deleteTemplate(dto.templateId, workspace.id);
    }
    async useTemplate(dto, user, workspace) {
        const template = await this.templateRepo.findById(dto.templateId, workspace.id);
        if (!template) {
            throw new common_1.ForbiddenException();
        }
        await this.validateTemplateReadAccess(user.id, template.spaceId);
        const ability = await this.spaceAbility.createForUser(user, dto.spaceId);
        if (ability.cannot(space_ability_type_1.SpaceCaslAction.Create, space_ability_type_1.SpaceCaslSubject.Page)) {
            throw new common_1.ForbiddenException();
        }
        return this.templateService.useTemplate(user.id, workspace.id, dto);
    }
    async validateTemplateReadAccess(userId, spaceId) {
        if (!spaceId)
            return;
        const userSpaceIds = await this.spaceMemberRepo.getUserSpaceIds(userId);
        if (!userSpaceIds.includes(spaceId)) {
            throw new common_1.ForbiddenException();
        }
    }
    async validateTemplateWriteAccess(user, workspace, spaceId) {
        if (!spaceId) {
            const wsAbility = this.workspaceAbility.createForUser(user, workspace);
            if (wsAbility.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Settings)) {
                throw new common_1.ForbiddenException('Only workspace admins can create global templates.');
            }
            return;
        }
        const ability = await this.spaceAbility.createForUser(user, spaceId);
        if (ability.can(space_ability_type_1.SpaceCaslAction.Manage, space_ability_type_1.SpaceCaslSubject.Settings)) {
            return;
        }
        const wsSettings = (workspace.settings ?? {});
        if (wsSettings?.templates?.allowMemberTemplates &&
            ability.can(space_ability_type_1.SpaceCaslAction.Manage, space_ability_type_1.SpaceCaslSubject.Page)) {
            return;
        }
        throw new common_1.ForbiddenException('You need edit access to this space to create templates.');
    }
};
exports.TemplateController = TemplateController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __param(3, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_list_dto_1.TemplateListDto,
        pagination_options_1.PaginationOptions, Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('info'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_id_dto_1.TemplateIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getTemplate", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.TEMPLATES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "createTemplate", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.TEMPLATES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_template_dto_1.UpdateTemplateDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "updateTemplate", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.TEMPLATES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_id_dto_1.TemplateIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "deleteTemplate", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.TEMPLATES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('use'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [use_template_dto_1.UseTemplateDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "useTemplate", null);
exports.TemplateController = TemplateController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('templates'),
    __metadata("design:paramtypes", [template_service_1.TemplateService,
        template_repo_1.TemplateRepo,
        space_member_repo_1.SpaceMemberRepo,
        workspace_ability_factory_1.default,
        space_ability_factory_1.default])
], TemplateController);
//# sourceMappingURL=template.controller.js.map