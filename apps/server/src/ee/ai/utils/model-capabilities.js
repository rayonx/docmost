"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportsTemperature = supportsTemperature;
const REASONING_MODEL_PREFIXES = ['gpt-5', 'o1', 'o3', 'o4'];
function supportsTemperature(modelName) {
    if (!modelName)
        return true;
    const lower = modelName.toLowerCase();
    return !REASONING_MODEL_PREFIXES.some((prefix) => lower.startsWith(prefix));
}
//# sourceMappingURL=model-capabilities.js.map