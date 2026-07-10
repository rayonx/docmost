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
exports.CommentResolutionController = void 0;
const common_1 = require("@nestjs/common");
const comment_resolution_service_1 = require("./comment-resolution.service");
const resolve_comment_dto_1 = require("./dto/resolve-comment.dto");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const page_repo_1 = require("../../database/repos/page/page.repo");
const comment_repo_1 = require("../../database/repos/comment/comment.repo");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
const page_access_service_1 = require("../../core/page/page-access/page-access.service");
let CommentResolutionController = class CommentResolutionController {
    constructor(commentResolutionService, commentRepo, pageRepo, pageAccessService) {
        this.commentResolutionService = commentResolutionService;
        this.commentRepo = commentRepo;
        this.pageRepo = pageRepo;
        this.pageAccessService = pageAccessService;
    }
    async resolveComment(resolveCommentDto, user, workspace) {
        const comment = await this.commentRepo.findById(resolveCommentDto.commentId);
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        const page = await this.pageRepo.findById(comment.pageId);
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.pageAccessService.validateCanComment(page, user, workspace.id);
        let canEdit = true;
        try {
            await this.pageAccessService.validateCanEdit(page, user);
        }
        catch {
            canEdit = false;
        }
        return this.commentResolutionService.resolveComment(comment, resolveCommentDto.resolved, user, { updateYjsMark: !canEdit });
    }
};
exports.CommentResolutionController = CommentResolutionController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.COMMENT_RESOLUTION),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('resolve'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resolve_comment_dto_1.ResolveCommentDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CommentResolutionController.prototype, "resolveComment", null);
exports.CommentResolutionController = CommentResolutionController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [comment_resolution_service_1.CommentResolutionService,
        comment_repo_1.CommentRepo,
        page_repo_1.PageRepo,
        page_access_service_1.PageAccessService])
], CommentResolutionController);
//# sourceMappingURL=comment-resolution.controller.js.map