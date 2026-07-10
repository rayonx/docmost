"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIDriver = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@ai-sdk/openai");
const ai_1 = require("ai");
const ai_constants_1 = require("../ai.constants");
const proxy_fetch_1 = require("../../common/proxy-fetch");
const model_capabilities_1 = require("../utils/model-capabilities");
class OpenAIDriver {
    constructor(config) {
        this.logger = new common_1.Logger(OpenAIDriver.name);
        this.provider = (0, openai_1.createOpenAI)({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
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
            const options = {
                model: this.provider(this.completionModel),
                messages,
                maxOutputTokens: params.maxTokens ?? ai_constants_1.DEFAULT_AI_CONFIG.maxTokens,
            };
            if ((0, model_capabilities_1.supportsTemperature)(this.completionModel)) {
                options.temperature = params.temperature ?? ai_constants_1.DEFAULT_AI_CONFIG.temperature;
            }
            const { text, usage } = await (0, ai_1.generateText)(options);
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
            const options = {
                model: this.provider(this.completionModel),
                messages,
                maxOutputTokens: params.maxTokens ?? ai_constants_1.DEFAULT_AI_CONFIG.maxTokens,
                onError: ({ error }) => {
                    this.logger.error({ err: error }, 'Stream error');
                    throw new common_1.BadRequestException(error);
                },
            };
            if ((0, model_capabilities_1.supportsTemperature)(this.completionModel)) {
                options.temperature = params.temperature ?? ai_constants_1.DEFAULT_AI_CONFIG.temperature;
            }
            const { textStream } = (0, ai_1.streamText)(options);
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
                model: this.provider.embedding(this.embeddingModel),
                value: text,
            };
            if (this.apiEmbeddingDimensions) {
                options.providerOptions = {
                    openai: {
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
                model: this.provider.embedding(this.embeddingModel),
                values: texts,
            };
            if (this.apiEmbeddingDimensions) {
                options.providerOptions = {
                    openai: {
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
exports.OpenAIDriver = OpenAIDriver;
//# sourceMappingURL=openai.driver.js.map