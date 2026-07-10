export declare const AI_CONFIG_TOKEN = "AI_CONFIG_TOKEN";
export declare const AI_DRIVER_TOKEN = "AI_DRIVER_TOKEN";
export declare const MAX_VECTOR_DIMENSIONS = 1536;
export declare const AI_SYSTEM_PROMPTS: {
    IMPROVE_WRITING: () => string;
    FIX_SPELLING_GRAMMAR: () => string;
    MAKE_SHORTER: () => string;
    MAKE_LONGER: () => string;
    SIMPLIFY: () => string;
    SUMMARIZE: () => string;
    EXPLAIN: () => string;
    CONTINUE_WRITING: () => string;
    CHANGE_TONE: (input?: {
        tone?: string;
    }) => string;
    TRANSLATE: (input?: {
        language?: string;
    }) => string;
};
export declare const EDITOR_OUTPUT_CONTRACT: string;
export declare const DEFAULT_AI_CONFIG: {
    maxTokens: number;
    temperature: number;
};
