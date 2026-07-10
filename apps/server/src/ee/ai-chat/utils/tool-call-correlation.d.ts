export type RawStepToolCall = {
    toolCallId: string;
    toolName: string;
    input: unknown;
};
export type RawStepToolResult = {
    toolCallId: string;
    output: unknown;
};
export type CorrelatedToolCall = {
    toolCallId: string;
    toolName: string;
    input: unknown;
    result: unknown;
};
export declare function correlateToolCallsWithResults(calls: RawStepToolCall[], results: RawStepToolResult[]): CorrelatedToolCall[];
