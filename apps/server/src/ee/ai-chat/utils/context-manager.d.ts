import type { AiChatMessage } from "../../../database/types/entity.types";
export type TokenBudget = {
    modelLimit: number;
    systemPromptTokens: number;
    toolDefinitionTokens: number;
    responseReserve: number;
    availableForHistory: number;
};
export declare function getModelContextLimit(modelName: string): number;
export declare function calculateTokenBudget(modelName: string, systemPrompt: string): TokenBudget;
export declare function truncateHistory(history: AiChatMessage[], availableTokens: number): AiChatMessage[];
