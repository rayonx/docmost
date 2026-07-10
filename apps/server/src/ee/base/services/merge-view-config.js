"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeViewConfig = mergeViewConfig;
function mergeViewConfig(existing, patch) {
    const base = existing && typeof existing === 'object' && !Array.isArray(existing)
        ? existing
        : {};
    const out = { ...base };
    for (const [key, value] of Object.entries(patch)) {
        if (value === null)
            delete out[key];
        else if (value !== undefined)
            out[key] = value;
    }
    return out;
}
//# sourceMappingURL=merge-view-config.js.map