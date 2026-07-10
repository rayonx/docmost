import { AiAction } from '../interfaces/ai-provider.interface';
export declare class AiGenerateDto {
    action?: AiAction;
    content: string;
    prompt?: string;
}
export declare class AiContentResponseDto {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
