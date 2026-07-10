export interface ModelPreset {
    id: string;
    name: string;
    provider: 'openai' | 'openai-compatible' | 'gemini' | 'ollama';
    dimensions: number;
    maxDimensions: number;
    maxTokens: number;
    supportsDimensionParam: boolean;
}
export declare const EMBEDDING_MODEL_PRESETS: ModelPreset[];
export declare function getModelPreset(modelName: string, provider?: string): ModelPreset | null;
export declare function getModelDimension(modelName: string, provider?: string): number;
export declare function getModelMaxTokens(modelName: string, provider?: string): number;
export declare function supportsDimensionParam(modelName: string, provider?: string): boolean;
