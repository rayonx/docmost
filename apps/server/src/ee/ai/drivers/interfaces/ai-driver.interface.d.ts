export interface GenerateCompletionParams {
    systemPrompt?: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
}
export interface GenerateCompletionStreamParams extends GenerateCompletionParams {
    stream: true;
}
export interface CompletionResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface AiDriver {
    generateCompletion(params: GenerateCompletionParams): Promise<CompletionResponse>;
    generateCompletionStream(params: GenerateCompletionStreamParams): Promise<AsyncIterable<string>>;
    generateEmbeddings(text: string): Promise<number[]>;
    generateEmbeddingsBatch(texts: string[]): Promise<number[][]>;
}
