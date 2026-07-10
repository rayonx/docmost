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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const ai_provider_interface_1 = require("../interfaces/ai-provider.interface");
const ai_constants_1 = require("../ai.constants");
const locale_language_1 = require("../utils/locale-language");
let AiService = class AiService {
    constructor(aiDriver) {
        this.aiDriver = aiDriver;
    }
    isDriverConfigured() {
        return this.aiDriver !== null;
    }
    async generateCompletionStream(params) {
        return this.aiDriver.generateCompletionStream(params);
    }
    async generateEmbeddings(text) {
        try {
            return this.aiDriver.generateEmbeddings(text);
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async generateEmbeddingsBatch(text) {
        try {
            return this.aiDriver.generateEmbeddingsBatch(text);
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    async generateStream(dto, locale) {
        const { systemPrompt, userPrompt } = this.buildPrompts(dto, locale);
        try {
            const stream = await this.aiDriver.generateCompletionStream({
                systemPrompt,
                userPrompt,
                temperature: ai_constants_1.DEFAULT_AI_CONFIG.temperature,
                maxTokens: ai_constants_1.DEFAULT_AI_CONFIG.maxTokens,
                stream: true,
            });
            return { stream };
        }
        catch (error) {
            this.handleApiError(error);
        }
    }
    buildPrompts(dto, locale) {
        const instruction = dto.action
            ? this.buildActionSystemPrompt(dto, locale)
            : dto.prompt || '';
        const systemPrompt = instruction
            ? `${ai_constants_1.EDITOR_OUTPUT_CONTRACT}\n\n${instruction}`
            : ai_constants_1.EDITOR_OUTPUT_CONTRACT;
        return { systemPrompt, userPrompt: dto.content };
    }
    buildActionSystemPrompt(dto, locale) {
        const action = dto.action;
        if (action === ai_provider_interface_1.AiAction.CUSTOM) {
            return dto.prompt || '';
        }
        const promptMap = {
            [ai_provider_interface_1.AiAction.IMPROVE_WRITING]: ai_constants_1.AI_SYSTEM_PROMPTS.IMPROVE_WRITING(),
            [ai_provider_interface_1.AiAction.FIX_SPELLING_GRAMMAR]: ai_constants_1.AI_SYSTEM_PROMPTS.FIX_SPELLING_GRAMMAR(),
            [ai_provider_interface_1.AiAction.MAKE_SHORTER]: ai_constants_1.AI_SYSTEM_PROMPTS.MAKE_SHORTER(),
            [ai_provider_interface_1.AiAction.MAKE_LONGER]: ai_constants_1.AI_SYSTEM_PROMPTS.MAKE_LONGER(),
            [ai_provider_interface_1.AiAction.SIMPLIFY]: ai_constants_1.AI_SYSTEM_PROMPTS.SIMPLIFY(),
            [ai_provider_interface_1.AiAction.SUMMARIZE]: ai_constants_1.AI_SYSTEM_PROMPTS.SUMMARIZE(),
            [ai_provider_interface_1.AiAction.CONTINUE_WRITING]: ai_constants_1.AI_SYSTEM_PROMPTS.CONTINUE_WRITING(),
            [ai_provider_interface_1.AiAction.EXPLAIN]: ai_constants_1.AI_SYSTEM_PROMPTS.EXPLAIN(),
            [ai_provider_interface_1.AiAction.CHANGE_TONE]: ai_constants_1.AI_SYSTEM_PROMPTS.CHANGE_TONE({
                tone: dto.prompt,
            }),
            [ai_provider_interface_1.AiAction.TRANSLATE]: ai_constants_1.AI_SYSTEM_PROMPTS.TRANSLATE({
                language: dto.prompt,
            }),
        };
        const basePrompt = promptMap[action];
        if (!basePrompt) {
            throw new common_1.BadRequestException(`Unknown action: ${action}`);
        }
        if (action === ai_provider_interface_1.AiAction.TRANSLATE) {
            return basePrompt;
        }
        const directive = (0, locale_language_1.buildSourceLanguageDirective)(locale);
        return `${directive}\n\n${basePrompt}\n\nFinal reminder: write your entire response in the same language as the user's source text. Do not use English unless the source text is in English.`;
    }
    handleApiError(error) {
        throw new common_1.BadRequestException(`AI service error: ${error?.['message'] || 'Unknown error'}`);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ai_constants_1.AI_DRIVER_TOKEN)),
    __metadata("design:paramtypes", [Object])
], AiService);
//# sourceMappingURL=ai.service.js.map