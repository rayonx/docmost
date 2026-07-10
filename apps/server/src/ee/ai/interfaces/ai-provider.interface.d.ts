export interface AiContentResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface AiStreamResponse {
    stream: AsyncIterable<string>;
}
export declare enum AiAction {
    IMPROVE_WRITING = "improve_writing",
    FIX_SPELLING_GRAMMAR = "fix_spelling_grammar",
    MAKE_SHORTER = "make_shorter",
    MAKE_LONGER = "make_longer",
    SIMPLIFY = "simplify",
    CHANGE_TONE = "change_tone",
    SUMMARIZE = "summarize",
    EXPLAIN = "explain",
    CONTINUE_WRITING = "continue_writing",
    TRANSLATE = "translate",
    CUSTOM = "custom"
}
