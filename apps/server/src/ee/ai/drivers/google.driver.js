"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAIDriver = void 0;
const common_1 = require("@nestjs/common");
const google_1 = require("@ai-sdk/google");
const ai_1 = require("ai");
const ai_constants_1 = require("../ai.constants");
const proxy_fetch_1 = require("../../common/proxy-fetch");
class GoogleAIDriver {
    constructor(config) {
        this.logger = new common_1.Logger(GoogleAIDriver.name);
        this.provider = (0, google_1.createGoogleGenerativeAI)({
            apiKey: config.apiKey,
            fetch: (0, proxy_fetch_1.getProxyAwareFetch)(),
        });
        this.completionModel = config.completionModel;
        this.embeddingModel = config.embeddingModel;
        this.apiEmbeddingDimensions = config.apiEmbeddingDimensions;
    }
    async generateCompletion(params) {
        const messages = [];
        if (params.systemPrompt) {
            messages.push({ role: 'system', content: params.systemPrompt });
        }
        messages.push({ role: 'user', content: params.userPrompt });
        try {
            const { text, usage } = await (0, ai_1.generateText)({
                model: this.provider(this.completionModel),
                messages,
                temperature: params.temperature ?? ai_constants_1.DEFAULT_AI_CONFIG.temperature,
                maxOutputTokens: params.maxTokens ?? ai_constants_1.DEFAULT_AI_CONFIG.maxTokens,
            });
            return {
                content: text,
                usage: usage
                    ? {
                        promptTokens: usage.inputTokens,
                        completionTokens: usage.outputTokens,
                        totalTokens: usage.totalTokens,
                    }
                    : undefined,
            };
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to generate completion');
            throw error;
        }
    }
    async generateCompletionStream(params) {
        const messages = [];
        if (params.systemPrompt) {
            messages.push({ role: 'system', content: params.systemPrompt });
        }
        messages.push({ role: 'user', content: params.userPrompt });
        try {
            const { textStream } = (0, ai_1.streamText)({
                model: this.provider(this.completionModel),
                messages,
                temperature: params.temperature ?? ai_constants_1.DEFAULT_AI_CONFIG.temperature,
                maxOutputTokens: params.maxTokens ?? ai_constants_1.DEFAULT_AI_CONFIG.maxTokens,
                onError: ({ error }) => {
                    this.logger.error({ err: error }, 'Stream error');
                    throw new common_1.BadRequestException(error);
                },
            });
            return textStream;
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to generate completion stream');
            throw error;
        }
    }
    async generateEmbeddings(text) {
        try {
            const googleOptions = {
                taskType: 'SEMANTIC_SIMILARITY',
            };
            if (this.apiEmbeddingDimensions) {
                googleOptions.outputDimensionality = this.apiEmbeddingDimensions;
            }
            const { embedding } = await (0, ai_1.embed)({
                model: this.provider.embeddingModel(this.embeddingModel),
                value: text,
                providerOptions: { google: googleOptions },
            });
            return embedding;
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to generate embedding');
            throw error;
        }
    }
    async generateEmbeddingsBatch(texts) {
        try {
            const googleOptions = {
                taskType: 'SEMANTIC_SIMILARITY',
            };
            if (this.apiEmbeddingDimensions) {
                googleOptions.outputDimensionality = this.apiEmbeddingDimensions;
            }
            const { embeddings } = await (0, ai_1.embedMany)({
                model: this.provider.embeddingModel(this.embeddingModel),
                values: texts,
                providerOptions: { google: googleOptions },
            });
            return embeddings;
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to generate batch embeddings');
            throw error;
        }
    }
}
exports.GoogleAIDriver = GoogleAIDriver;
//# sourceMappingURL=google.driver.js.map