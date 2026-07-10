export type AiChatMessageRole = 'user' | 'assistant' | 'tool';
export type AiChatToolCall = {
    id: string;
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
};
export type AiChatAttachmentMeta = {
    id: string;
    fileName: string;
    fileExt: string;
    textContent?: string | null;
    base64?: string;
    mimeType?: string | null;
    elided?: boolean;
};
export type AiChatMessageMetadata = {
    mentionedPageIds?: string[];
    attachmentIds?: string[];
    attachments?: AiChatAttachmentMeta[];
    model?: string;
    tokenUsage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
};
export type AiChatStreamEvent = {
    type: 'chat_created';
    chatId: string;
} | {
    type: 'content';
    text: string;
} | {
    type: 'tool_call';
    id: string;
    name: string;
    args: Record<string, unknown>;
} | {
    type: 'tool_result';
    id: string;
    result: unknown;
} | {
    type: 'done';
    messageId: string;
    usage?: Record<string, number>;
} | {
    type: 'error';
    message: string;
    code?: string;
    retryable?: boolean;
};
