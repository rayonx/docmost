export declare enum AiChatErrorCode {
    PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE",
    RATE_LIMITED = "RATE_LIMITED",
    CONTEXT_LENGTH_EXCEEDED = "CONTEXT_LENGTH_EXCEEDED",
    EMPTY_RESPONSE = "EMPTY_RESPONSE",
    CONTENT_FILTERED = "CONTENT_FILTERED",
    INVALID_API_KEY = "INVALID_API_KEY",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
type ErrorClassification = {
    code: AiChatErrorCode;
    retryable: boolean;
    userMessage: string;
};
export declare function classifyProviderError(error: unknown): ErrorClassification;
export declare function withRetry<T>(fn: () => Promise<T>, maxRetries?: number, baseDelayMs?: number): Promise<T>;
export {};
