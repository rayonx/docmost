import { AiDriver, CompletionResponse, GenerateCompletionParams, GenerateCompletionStreamParams } from './interfaces/ai-driver.interface';
import { OpenAICompatibleConfig } from './interfaces/ai-config.interface';
export declare class OpenAICompatibleDriver implements AiDriver {
    private readonly logger;
    private readonly provider;
    private readonly completionModel;
    private readonly embeddingModel;
    private readonly apiEmbeddingDimensions;
    constructor(config: OpenAICompatibleConfig);
    generateCompletion(params: GenerateCompletionParams): Promise<CompletionResponse>;
    generateCompletionStream(params: GenerateCompletionStreamParams): Promise<AsyncIterable<string>>;
    generateEmbeddings(text: string): Promise<number[]>;
    generateEmbeddingsBatch(texts: string[]): Promise<number[][]>;
}
