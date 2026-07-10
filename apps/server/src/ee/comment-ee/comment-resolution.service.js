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
var CommentResolutionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentResolutionService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const comment_repo_1 = require("../../database/repos/comment/comment.repo");
const constants_1 = require("../../integrations/queue/constants");
const ws_service_1 = require("../../ws/ws.service");
const collaboration_gateway_1 = require("../../collaboration/collaboration.gateway");
let CommentResolutionService = CommentResolutionService_1 = class CommentResolutionService {
    constructor(commentRepo, wsService, collaborationGateway, notificationQueue) {
        this.commentRepo = commentRepo;
        this.wsService = wsService;
        this.collaborationGateway = collaborationGateway;
        this.notificationQueue = notificationQueue;
        this.logger = new common_1.Logger(CommentResolutionService_1.name);
    }
    async resolveComment(comment, resolved, authUser, opts) {
        if (comment.parentCommentId) {
            throw new common_1.BadRequestException('Cannot resolve reply comments');
        }
        const updateData = {};
        if (resolved) {
            updateData.resolvedAt = new Date();
            updateData.resolvedById = authUser.id;
        }
        else {
            updateData.resolvedAt = null;
            updateData.resolvedById = null;
        }
        updateData.updatedAt = new Date();
        await this.commentRepo.updateComment(updateData, comment.id);
        if (resolved) {
            const jobData = {
                commentId: comment.id,
                commentCreatorId: comment.creatorId,
                pageId: comment.pageId,
                spaceId: comment.spaceId,
                workspaceId: comment.workspaceId,
                actorId: authUser.id,
            };
            await this.notificationQueue.add(constants_1.QueueJob.COMMENT_RESOLVED_NOTIFICATION, jobData);
        }
        if (opts?.updateYjsMark) {
            const documentName = `page.${comment.pageId}`;
            try {
                await this.collaborationGateway.handleYjsEvent('resolveCommentMark', documentName, {
                    commentId: comment.id,
                    resolved,
                    user: authUser,
                });
            }
            catch (error) {
                this.logger.error({ err: error }, `Failed to update comment mark for comment ${comment.id}`);
            }
        }
        const updatedComment = await this.commentRepo.findById(comment.id, {
            includeCreator: true,
            includeResolvedBy: true,
        });
        this.wsService.emitCommentEvent(comment.spaceId, comment.pageId, {
            operation: 'commentResolved',
            pageId: comment.pageId,
            comment: updatedComment,
        });
        return updatedComment;
    }
};
exports.CommentResolutionService = CommentResolutionService;
exports.CommentResolutionService = CommentResolutionService = CommentResolutionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)(constants_1.QueueName.NOTIFICATION_QUEUE)),
    __metadata("design:paramtypes", [comment_repo_1.CommentRepo,
        ws_service_1.WsService,
        collaboration_gateway_1.CollaborationGateway,
        bullmq_2.Queue])
], CommentResolutionService);
//# sourceMappingURL=comment-resolution.service.js.map