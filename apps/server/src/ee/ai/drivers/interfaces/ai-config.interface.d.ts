export declare enum AiDriver {
    OPENAI = "openai",
    OPENAI_COMPATIBLE = "openai-compatible",
    GEMINI = "gemini",
    OLLAMA = "ollama"
}
export interface OpenAIConfig {
    apiKey: string;
    baseURL?: string;
    completionModel: string;
    embeddingModel: string;
    embeddingDimensions?: number;
    apiEmbeddingDimensions?: number;
}
export interface OpenAICompatibleConfig {
    apiKey: string;
    baseURL: string;
    completionModel: string;
    embeddingModel: string;
    embeddingDimensions?: number;
    apiEmbeddingDimensions?: number;
}
export interface GeminiAIConfig {
    apiKey: string;
    completionModel: string;
    embeddingModel: string;
    embeddingDimensions: number;
    apiEmbeddingDimensions?: number;
}
export interface OllamaConfig {
    baseURL?: string;
    completionModel: string;
    embeddingModel: string;
    embeddingDimensions: number;
    apiEmbeddingDimensions?: number;
}
export type AiConfig = {
    provider: AiDriver.OPENAI;
    config: OpenAIConfig;
} | {
    provider: AiDriver.OPENAI_COMPATIBLE;
    config: OpenAICompatibleConfig;
} | {
    provider: AiDriver.GEMINI;
    config: GeminiAIConfig;
} | {
    provider: AiDriver.OLLAMA;
    config: OllamaConfig;
};
