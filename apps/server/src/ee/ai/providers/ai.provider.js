"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiDriverProvider = exports.aiDriverConfigProvider = void 0;
const environment_service_1 = require("../../../integrations/environment/environment.service");
const ai_constants_1 = require("../ai.constants");
const ai_config_interface_1 = require("../drivers/interfaces/ai-config.interface");
const drivers_1 = require("../drivers");
const model_presets_1 = require("../config/model-presets");
function createAiDriver(config) {
    if (!config)
        return null;
    switch (config.provider) {
        case ai_config_interface_1.AiDriver.OPENAI:
            return new drivers_1.OpenAIDriver(config.config);
        case ai_config_interface_1.AiDriver.OPENAI_COMPATIBLE:
            return new drivers_1.OpenAICompatibleDriver(config.config);
        case ai_config_interface_1.AiDriver.GEMINI:
            return new drivers_1.GoogleAIDriver(config.config);
        case ai_config_interface_1.AiDriver.OLLAMA:
            return new drivers_1.OllamaDriver(config.config);
        default:
            throw new Error(`Unknown AI provider`);
    }
}
exports.aiDriverConfigProvider = {
    provide: ai_constants_1.AI_CONFIG_TOKEN,
    useFactory: async (environmentService) => {
        const provider = environmentService
            .getAiDriver()
            ?.toLowerCase();
        if (!provider)
            return null;
        const embeddingModel = environmentService.getAiEmbeddingModel();
        const modelPreset = (0, model_presets_1.getModelPreset)(embeddingModel, provider);
        const embeddingDimensions = environmentService.getAiEmbeddingDimension() ||
            modelPreset?.dimensions ||
            ai_constants_1.MAX_VECTOR_DIMENSIONS;
        const explicitMrl = environmentService.getAiEmbeddingSupportsMrl();
        const supportsMrl = explicitMrl ?? modelPreset?.supportsDimensionParam ?? true;
        const apiEmbeddingDimensions = supportsMrl
            ? embeddingDimensions
            : undefined;
        switch (provider) {
            case ai_config_interface_1.AiDriver.OPENAI: {
                const apiKey = environmentService.getOpenAiApiKey();
                return {
                    provider,
                    config: {
                        apiKey,
                        baseURL: environmentService.getOpenAiApiUrl() || undefined,
                        completionModel: environmentService.getAiCompletionModel(),
                        embeddingModel,
                        embeddingDimensions,
                        apiEmbeddingDimensions,
                    },
                };
            }
            case ai_config_interface_1.AiDriver.OPENAI_COMPATIBLE: {
                const apiKey = environmentService.getOpenAiApiKey();
                const baseURL = environmentService.getOpenAiApiUrl();
                return {
                    provider,
                    config: {
                        apiKey,
                        baseURL,
                        completionModel: environmentService.getAiCompletionModel(),
                        embeddingModel,
                        embeddingDimensions,
                        apiEmbeddingDimensions,
                    },
                };
            }
            case ai_config_interface_1.AiDriver.GEMINI: {
                const apiKey = environmentService.getGeminiApiKey();
                return {
                    provider,
                    config: {
                        apiKey,
                        completionModel: environmentService.getAiCompletionModel(),
                        embeddingModel,
                        embeddingDimensions,
                        apiEmbeddingDimensions,
                    },
                };
            }
            case ai_config_interface_1.AiDriver.OLLAMA: {
                return {
                    provider,
                    config: {
                        baseURL: environmentService.getOllamaApiUrl(),
                        completionModel: environmentService.getAiCompletionModel(),
                        embeddingModel,
                        embeddingDimensions,
                        apiEmbeddingDimensions,
                    },
                };
            }
            default:
                return null;
        }
    },
    inject: [environment_service_1.EnvironmentService],
};
exports.aiDriverProvider = {
    provide: ai_constants_1.AI_DRIVER_TOKEN,
    useFactory: (config) => createAiDriver(config),
    inject: [ai_constants_1.AI_CONFIG_TOKEN],
};
//# sourceMappingURL=ai.provider.js.map