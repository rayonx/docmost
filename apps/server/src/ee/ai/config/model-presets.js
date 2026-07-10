"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMBEDDING_MODEL_PRESETS = void 0;
exports.getModelPreset = getModelPreset;
exports.getModelDimension = getModelDimension;
exports.getModelMaxTokens = getModelMaxTokens;
exports.supportsDimensionParam = supportsDimensionParam;
exports.EMBEDDING_MODEL_PRESETS = [
    {
        id: 'text-embedding-3-small',
        name: 'text-embedding-3-small',
        provider: 'openai',
        dimensions: 1536,
        maxDimensions: 1536,
        maxTokens: 8191,
        supportsDimensionParam: true,
    },
    {
        id: 'text-embedding-3-large',
        name: 'text-embedding-3-large',
        provider: 'openai',
        dimensions: 2000,
        maxDimensions: 3072,
        maxTokens: 8191,
        supportsDimensionParam: true,
    },
    {
        id: 'text-embedding-ada-002',
        name: 'text-embedding-ada-002',
        provider: 'openai',
        dimensions: 1536,
        maxDimensions: 1536,
        maxTokens: 8191,
        supportsDimensionParam: false,
    },
    {
        id: 'text-embedding-3-small',
        name: 'text-embedding-3-small',
        provider: 'openai-compatible',
        dimensions: 1536,
        maxDimensions: 1536,
        maxTokens: 8191,
        supportsDimensionParam: true,
    },
    {
        id: 'text-embedding-3-large',
        name: 'text-embedding-3-large',
        provider: 'openai-compatible',
        dimensions: 2000,
        maxDimensions: 3072,
        maxTokens: 8191,
        supportsDimensionParam: true,
    },
    {
        id: 'text-embedding-ada-002',
        name: 'text-embedding-ada-002',
        provider: 'openai-compatible',
        dimensions: 1536,
        maxDimensions: 1536,
        maxTokens: 8191,
        supportsDimensionParam: false,
    },
    {
        id: 'gemini-embedding-001',
        name: 'gemini-embedding-001',
        provider: 'gemini',
        dimensions: 2000,
        maxDimensions: 3072,
        maxTokens: 1500,
        supportsDimensionParam: true,
    },
    {
        id: 'nomic-embed-text',
        name: 'nomic-embed-text',
        provider: 'ollama',
        dimensions: 768,
        maxDimensions: 768,
        maxTokens: 8192,
        supportsDimensionParam: true,
    },
    {
        id: 'qwen3-embedding',
        name: 'qwen3-embedding',
        provider: 'ollama',
        dimensions: 2000,
        maxDimensions: 4096,
        maxTokens: 8192,
        supportsDimensionParam: true,
    },
];
function getModelPreset(modelName, provider) {
    return (exports.EMBEDDING_MODEL_PRESETS.find((preset) => preset.id === modelName && (!provider || preset.provider === provider)) || null);
}
function getModelDimension(modelName, provider) {
    const preset = getModelPreset(modelName, provider);
    return preset?.dimensions || 1536;
}
function getModelMaxTokens(modelName, provider) {
    const preset = getModelPreset(modelName, provider);
    return preset?.maxTokens || 2000;
}
function supportsDimensionParam(modelName, provider) {
    const preset = getModelPreset(modelName, provider);
    return preset?.supportsDimensionParam ?? false;
}
//# sourceMappingURL=model-presets.js.map