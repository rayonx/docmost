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
exports.AiChatController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const user_throttler_guard_1 = require("../../integrations/throttle/user-throttler.guard");
const throttler_names_1 = require("../../integrations/throttle/throttler-names");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
const ai_chat_enabled_guard_1 = require("./guards/ai-chat-enabled.guard");
const file_interceptor_1 = require("../../common/interceptors/file.interceptor");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const ai_chat_service_1 = require("./ai-chat.service");
const ai_chat_repo_1 = require("./ai-chat.repo");
const ai_chat_dto_1 = require("./dto/ai-chat.dto");
const pagination_options_1 = require("../../database/pagination/pagination-options");
const bytes = require("bytes");
const uuid_1 = require("uuid");
const environment_service_1 = require("../../integrations/environment/environment.service");
let AiChatController = class AiChatController {
    constructor(chatService, chatRepo, environmentService) {
        this.chatService = chatService;
        this.chatRepo = chatRepo;
        this.environmentService = environmentService;
    }
    async createChat(user, workspace) {
        return this.chatService.createChat(user.id, workspace.id);
    }
    async listChats(pagination, user, workspace) {
        return this.chatRepo.findChatsByUser(workspace.id, user.id, pagination);
    }
    async getChatInfo(dto, user, workspace) {
        return this.chatService.getChatWithMessages(dto.chatId, user.id, workspace.id);
    }
    async deleteChat(dto, user, workspace) {
        await this.chatService.deleteChat(dto.chatId, user.id, workspace.id);
    }
    async updateChat(dto, user, workspace) {
        await this.chatService.updateChatTitle(dto.chatId, user.id, workspace.id, dto.title);
    }
    async searchChats(dto, user, workspace) {
        return this.chatRepo.searchChats(workspace.id, user.id, dto.query);
    }
    async sendMessage(dto, user, workspace, req, reply) {
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });
        const abortController = new AbortController();
        req.raw.on('close', () => abortController.abort());
        try {
            const stream = this.chatService.sendMessage(user, workspace, {
                chatId: dto.chatId,
                content: dto.content,
                mentionedPageIds: dto.mentionedPageIds,
                contextPageId: dto.contextPageId,
                attachmentIds: dto.attachmentIds,
            }, abortController.signal);
            for await (const event of stream) {
                if (abortController.signal.aborted)
                    break;
                reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
            }
        }
        catch (error) {
            if (!abortController.signal.aborted) {
                reply.raw.write(`data: ${JSON.stringify({ type: 'error', message: error?.['message'] || 'Unknown error' })}\n\n`);
            }
        }
        finally {
            if (!abortController.signal.aborted) {
                reply.raw.write('data: [DONE]\n\n');
            }
            reply.raw.end();
        }
    }
    async uploadFile(req, res, user, workspace) {
        const maxFileSize = bytes(this.environmentService.getFileUploadSizeLimit());
        let file = null;
        try {
            file = await req.file({
                limits: { fileSize: maxFileSize, fields: 2, files: 1 },
            });
        }
        catch (err) {
            if (err?.statusCode === 413) {
                throw new common_1.BadRequestException(`File too large. Exceeds the ${this.environmentService.getFileUploadSizeLimit()} limit`);
            }
        }
        if (!file) {
            throw new common_1.BadRequestException('Failed to upload file');
        }
        const chatId = file.fields?.chatId?.value;
        if (chatId && !(0, uuid_1.validate)(chatId)) {
            throw new common_1.BadRequestException('Invalid chat id');
        }
        try {
            const result = await this.chatService.uploadChatFile(file, user.id, workspace.id, chatId);
            return res.send(result);
        }
        catch (err) {
            if (err?.statusCode === 413) {
                throw new common_1.BadRequestException(`File too large. Exceeds the ${this.environmentService.getFileUploadSizeLimit()} limit`);
            }
            throw new common_1.BadRequestException('Error processing file upload.');
        }
    }
};
exports.AiChatController = AiChatController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.AI),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard, ai_chat_enabled_guard_1.AiChatEnabledGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "createChat", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_options_1.PaginationOptions, Object, Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "listChats", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('info'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.ChatIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "getChatInfo", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.AI),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard, ai_chat_enabled_guard_1.AiChatEnabledGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.ChatIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "deleteChat", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.AI),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard, ai_chat_enabled_guard_1.AiChatEnabledGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.UpdateChatDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "updateChat", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.SearchChatsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "searchChats", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.AI),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard, ai_chat_enabled_guard_1.AiChatEnabledGuard, user_throttler_guard_1.UserThrottlerGuard),
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.AUTH_THROTTLER]: true }),
    (0, throttler_1.Throttle)({ [throttler_names_1.AI_CHAT_THROTTLER]: { limit: 25, ttl: 60_000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.SendMessageDto, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "sendMessage", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.AI),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard, ai_chat_enabled_guard_1.AiChatEnabledGuard, user_throttler_guard_1.UserThrottlerGuard),
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.AUTH_THROTTLER]: true }),
    (0, throttler_1.Throttle)({ [throttler_names_1.AI_CHAT_THROTTLER]: { limit: 25, ttl: 60_000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)(file_interceptor_1.FileInterceptor),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __param(3, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "uploadFile", null);
exports.AiChatController = AiChatController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai/chats'),
    __metadata("design:paramtypes", [ai_chat_service_1.AiChatService,
        ai_chat_repo_1.AiChatRepo,
        environment_service_1.EnvironmentService])
], AiChatController);
//# sourceMappingURL=ai-chat.controller.js.map