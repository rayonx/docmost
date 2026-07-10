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
exports.AiContentController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const auth_user_decorator_1 = require("../../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
const ai_search_service_1 = require("../services/ai-search.service");
const search_dto_1 = require("../../../core/search/dto/search.dto");
const space_ability_type_1 = require("../../../core/casl/interfaces/space-ability.type");
const space_ability_factory_1 = require("../../../core/casl/abilities/space-ability.factory");
const ai_content_dto_1 = require("../dto/ai-content.dto");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const ai_service_1 = require("../services/ai.service");
let AiContentController = class AiContentController {
    constructor(vectorService, spaceAbility, environmentService, aiService) {
        this.vectorService = vectorService;
        this.spaceAbility = spaceAbility;
        this.environmentService = environmentService;
        this.aiService = aiService;
    }
    async ragSearch(searchDto, user, workspace, reply) {
        if (searchDto.spaceId) {
            const ability = await this.spaceAbility.createForUser(user, searchDto.spaceId);
            if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
                throw new common_1.ForbiddenException();
            }
        }
        const aiSearchEnabled = workspace?.settings?.['ai']?.['search'] === true;
        if (!aiSearchEnabled) {
            throw new common_1.ForbiddenException('AI answer feature is not enabled for this workspace');
        }
        const response = await this.vectorService.askAiSearch(searchDto, {
            userId: user.id,
            workspaceId: workspace.id,
            locale: user.locale,
        });
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });
        try {
            reply.raw.write(`data: ${JSON.stringify({ sources: response.sources })}\n\n`);
            for await (const chunk of response.stream) {
                reply.raw.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }
            reply.raw.write('data: [DONE]\n\n');
        }
        catch (error) {
            reply.raw.write(`data: ${JSON.stringify({ error: error?.['message'] })}\n\n`);
        }
        finally {
            reply.raw.end();
        }
    }
    async generateStream(dto, user, workspace, reply) {
        const generativeAiEnabled = workspace?.settings?.['ai']?.['generative'] === true;
        if (!generativeAiEnabled) {
            throw new common_1.ForbiddenException('Generative AI is not enabled for this workspace');
        }
        const response = await this.aiService.generateStream(dto, user.locale);
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });
        try {
            for await (const chunk of response.stream) {
                reply.raw.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }
            reply.raw.write('data: [DONE]\n\n');
        }
        catch (error) {
            reply.raw.write(`data: ${JSON.stringify({ error: error?.['message'] })}\n\n`);
        }
        finally {
            reply.raw.end();
        }
    }
};
exports.AiContentController = AiContentController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('answers'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_dto_1.SearchDTO, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AiContentController.prototype, "ragSearch", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('generate/stream'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_content_dto_1.AiGenerateDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AiContentController.prototype, "generateStream", null);
exports.AiContentController = AiContentController = __decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.AI),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_search_service_1.AiSearchService,
        space_ability_factory_1.default,
        environment_service_1.EnvironmentService,
        ai_service_1.AiService])
], AiContentController);
//# sourceMappingURL=ai-content.controller.js.map