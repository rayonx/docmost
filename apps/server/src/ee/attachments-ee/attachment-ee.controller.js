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
exports.AttachmentEeController = void 0;
const common_1 = require("@nestjs/common");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const attachment_ee_service_1 = require("./attachment-ee.service");
const space_ability_factory_1 = require("../../core/casl/abilities/space-ability.factory");
const search_dto_1 = require("../../core/search/dto/search.dto");
const space_ability_type_1 = require("../../core/casl/interfaces/space-ability.type");
const workspace_ability_type_1 = require("../../core/casl/interfaces/workspace-ability.type");
const workspace_ability_factory_1 = require("../../core/casl/abilities/workspace-ability.factory");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
let AttachmentEeController = class AttachmentEeController {
    constructor(attachmentEeService, spaceAbility, workspaceAbility) {
        this.attachmentEeService = attachmentEeService;
        this.spaceAbility = spaceAbility;
        this.workspaceAbility = workspaceAbility;
    }
    async searchAttachments(searchDto, user, workspace) {
        if (searchDto.spaceId) {
            const ability = await this.spaceAbility.createForUser(user, searchDto.spaceId);
            if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
                throw new common_1.ForbiddenException();
            }
        }
        return this.attachmentEeService.searchAttachment(searchDto.query, searchDto, {
            userId: user.id,
            workspaceId: workspace.id,
        });
    }
    async indexAttachments(user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Settings)) {
            throw new common_1.ForbiddenException();
        }
        await this.attachmentEeService.triggerAttachmentsIndexing(workspace.id);
    }
};
exports.AttachmentEeController = AttachmentEeController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.ATTACHMENT_INDEXING),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_dto_1.SearchDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], AttachmentEeController.prototype, "searchAttachments", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.ATTACHMENT_INDEXING),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('indexing'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttachmentEeController.prototype, "indexAttachments", null);
exports.AttachmentEeController = AttachmentEeController = __decorate([
    (0, common_1.Controller)('search-attachments'),
    __metadata("design:paramtypes", [attachment_ee_service_1.AttachmentEeService,
        space_ability_factory_1.default,
        workspace_ability_factory_1.default])
], AttachmentEeController);
//# sourceMappingURL=attachment-ee.controller.js.map