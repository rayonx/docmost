export declare function countTokens(text: string): number;
export declare function truncateToTokenBudget(text: string, maxTokens: number): {
    text: string;
    truncated: boolean;
};
export declare function countMessageTokens(role: string, content: string | null, toolCalls?: unknown[] | null): number;
