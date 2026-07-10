"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAICompatibleDriver = void 0;
const common_1 = require("@nestjs/common");
const openai_compatible_1 = require("@ai-sdk/openai-compatible");
const ai_1 = require("ai");
const ai_constants_1 = require("../ai.constants");
const proxy_fetch_1 = require("../../common/proxy-fetch");
class OpenAICompatibleDriver {
    constructor(config) {
        this.logger = new common_1.Logger(OpenAICompatibleDriver.name);
        this.provider = (0, openai_compatible_1.createOpenAICompatible)({
            name: 'openai-compatible',
            baseURL: config.baseURL,
            apiKey: config.apiKey,
            fetch: (0, proxy_fetch_1.getProxyAwareFetch)(),
        });
        this.completionModel = config.completionModel;
        this.embeddingModel = config.embeddingModel;
        this.apiEmbeddingDimensions = config.apiEmbeddingDimensions ?? null;
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
            const options = {
                model: this.provider.embeddingModel(this.embeddingModel),
                value: text,
            };
            if (this.apiEmbeddingDimensions) {
                options.providerOptions = {
                    'openai-compatible': {
                        dimensions: this.apiEmbeddingDimensions,
                    },
                };
            }
            const { embedding } = await (0, ai_1.embed)(options);
            return embedding;
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to generate embedding');
            throw error;
        }
    }
    async generateEmbeddingsBatch(texts) {
        try {
            const options = {
                model: this.provider.embeddingModel(this.embeddingModel),
                values: texts,
            };
            if (this.apiEmbeddingDimensions) {
                options.providerOptions = {
                    'openai-compatible': {
                        dimensions: this.apiEmbeddingDimensions,
                    },
                };
            }
            const { embeddings } = await (0, ai_1.embedMany)(options);
            return embeddings;
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to generate batch embeddings');
            throw error;
        }
    }
}
exports.OpenAICompatibleDriver = OpenAICompatibleDriver;
//# sourceMappingURL=openai-compatible.driver.js.map