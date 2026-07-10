import { type LanguageModel } from 'ai';
import type { AiChatMessage } from "../../../database/types/entity.types";
export declare function shouldCompress(history: AiChatMessage[], availableTokens: number): boolean;
export declare function splitForCompression(history: AiChatMessage[], availableTokens: number): {
    older: AiChatMessage[];
    recent: AiChatMessage[];
};
export declare function compressHistory(model: LanguageModel, older: AiChatMessage[]): Promise<string>;
