"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatErrorCode = void 0;
exports.classifyProviderError = classifyProviderError;
exports.withRetry = withRetry;
var AiChatErrorCode;
(function (AiChatErrorCode) {
    AiChatErrorCode["PROVIDER_UNAVAILABLE"] = "PROVIDER_UNAVAILABLE";
    AiChatErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    AiChatErrorCode["CONTEXT_LENGTH_EXCEEDED"] = "CONTEXT_LENGTH_EXCEEDED";
    AiChatErrorCode["EMPTY_RESPONSE"] = "EMPTY_RESPONSE";
    AiChatErrorCode["CONTENT_FILTERED"] = "CONTENT_FILTERED";
    AiChatErrorCode["INVALID_API_KEY"] = "INVALID_API_KEY";
    AiChatErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(AiChatErrorCode || (exports.AiChatErrorCode = AiChatErrorCode = {}));
function classifyProviderError(error) {
    const msg = error instanceof Error ? error.message : String(error);
    const lower = msg.toLowerCase();
    if (lower.includes('rate limit') || lower.includes('429') || lower.includes('too many requests')) {
        return {
            code: AiChatErrorCode.RATE_LIMITED,
            retryable: true,
            userMessage: 'The AI provider is rate limiting requests. Please try again in a moment.',
        };
    }
    if (lower.includes('context length') || lower.includes('maximum context') || lower.includes('token limit') || lower.includes('max_tokens')) {
        return {
            code: AiChatErrorCode.CONTEXT_LENGTH_EXCEEDED,
            retryable: false,
            userMessage: 'The conversation is too long for the current model. Try starting a new chat.',
        };
    }
    if (lower.includes('content filter') || lower.includes('content_policy') || lower.includes('safety')) {
        return {
            code: AiChatErrorCode.CONTENT_FILTERED,
            retryable: false,
            userMessage: 'The response was blocked by the content filter.',
        };
    }
    if (lower.includes('invalid api key') || lower.includes('401') || lower.includes('unauthorized') || lower.includes('authentication')) {
        return {
            code: AiChatErrorCode.INVALID_API_KEY,
            retryable: false,
            userMessage: 'AI provider authentication failed. Please check your API key configuration.',
        };
    }
    if (lower.includes('503') || lower.includes('502') || lower.includes('service unavailable') || lower.includes('overloaded')) {
        return {
            code: AiChatErrorCode.PROVIDER_UNAVAILABLE,
            retryable: true,
            userMessage: 'The AI provider is temporarily unavailable. Please try again.',
        };
    }
    return {
        code: AiChatErrorCode.INTERNAL_ERROR,
        retryable: false,
        userMessage: msg || 'An unexpected error occurred.',
    };
}
async function withRetry(fn, maxRetries = 2, baseDelayMs = 1000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            const { retryable } = classifyProviderError(error);
            if (!retryable || attempt === maxRetries)
                throw error;
            const delay = baseDelayMs * Math.pow(2, attempt);
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    throw lastError;
}
//# sourceMappingURL=ai-chat-errors.js.map