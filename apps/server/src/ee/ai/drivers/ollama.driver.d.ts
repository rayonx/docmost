import { AiDriver, CompletionResponse, GenerateCompletionParams, GenerateCompletionStreamParams } from './interfaces/ai-driver.interface';
import { OllamaConfig } from './interfaces/ai-config.interface';
export declare class OllamaDriver implements AiDriver {
    private readonly logger;
    private readonly provider;
    private readonly completionModel;
    private readonly embeddingModel;
    private readonly apiEmbeddingDimensions;
    constructor(config: OllamaConfig);
    generateCompletion(params: GenerateCompletionParams): Promise<CompletionResponse>;
    generateCompletionStream(params: GenerateCompletionStreamParams): Promise<AsyncIterable<string>>;
    generateEmbeddings(text: string): Promise<number[]>;
    generateEmbeddingsBatch(texts: string[]): Promise<number[][]>;
}
