"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countTokens = countTokens;
exports.truncateToTokenBudget = truncateToTokenBudget;
exports.countMessageTokens = countMessageTokens;
const js_tiktoken_1 = require("js-tiktoken");
let encoder = null;
function getEncoder() {
    if (!encoder) {
        try {
            encoder = (0, js_tiktoken_1.encodingForModel)('gpt-4o');
        }
        catch {
            encoder = (0, js_tiktoken_1.getEncoding)('cl100k_base');
        }
    }
    return encoder;
}
function countTokens(text) {
    if (!text)
        return 0;
    return getEncoder().encode(text).length;
}
function truncateToTokenBudget(text, maxTokens) {
    if (!text || maxTokens <= 0) {
        return { text: '', truncated: !!text };
    }
    const tiktoken = getEncoder();
    const tokens = tiktoken.encode(text);
    if (tokens.length <= maxTokens) {
        return { text, truncated: false };
    }
    return { text: tiktoken.decode(tokens.slice(0, maxTokens)), truncated: true };
}
function countMessageTokens(role, content, toolCalls) {
    const overhead = 4;
    let tokens = overhead;
    if (content) {
        tokens += countTokens(content);
    }
    if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0) {
        tokens += countTokens(JSON.stringify(toolCalls));
    }
    return tokens;
}
//# sourceMappingURL=token-counter.js.map