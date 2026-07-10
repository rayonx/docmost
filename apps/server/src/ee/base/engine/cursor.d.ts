import { SortBuild, TailKey } from './sort';
export declare function makeCursor(sorts: SortBuild[], tailKeys: TailKey[]): {
    encodeCursor(values: Array<[string, unknown]>): string;
    decodeCursor(cursor: string, fieldNames: string[]): Record<string, string>;
    parseCursor(decoded: Record<string, string>): Record<string, unknown>;
};
