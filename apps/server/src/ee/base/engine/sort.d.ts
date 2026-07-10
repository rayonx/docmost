import { RawBuilder } from 'kysely';
import { SortSpec } from './schema.zod';
import { PropertySchema } from './predicate';
export type SortBuild = {
    key: string;
    expression: RawBuilder<any>;
    direction: 'asc' | 'desc';
    valueType: 'numeric' | 'date' | 'text' | 'bool';
};
export type TailKey = 'position' | 'id';
export declare const CURSOR_TAIL_KEYS: TailKey[];
export declare function buildSorts(sorts: SortSpec[], schema: PropertySchema): SortBuild[];
