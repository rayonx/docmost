import { AiStreamResponse } from '../interfaces/ai-provider.interface';
import { AiGenerateDto } from '../dto/ai-content.dto';
import { AiDriver, GenerateCompletionStreamParams } from "../drivers";
export declare class AiService {
    private readonly aiDriver;
    constructor(aiDriver: AiDriver);
    isDriverConfigured(): boolean;
    generateCompletionStream(params: GenerateCompletionStreamParams): Promise<AsyncIterable<string>>;
    generateEmbeddings(text: string): Promise<number[]>;
    generateEmbeddingsBatch(text: string[]): Promise<number[][]>;
    generateStream(dto: AiGenerateDto, locale?: string | null): Promise<AiStreamResponse>;
    private buildPrompts;
    private buildActionSystemPrompt;
    private handleApiError;
}
