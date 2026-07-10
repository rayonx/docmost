export declare const DEFAULTABLE_PROPERTY_TYPES: ReadonlySet<string>;
export declare function normalizeSelectDefaultValue<T extends {
    choices?: {
        id: string;
    }[];
    defaultValue?: string | string[] | null;
}>(options: T, opts: {
    multi: boolean;
}): T;
export declare function normalizePersonDefaultValue<T extends {
    allowMultiple?: boolean;
    defaultValue?: string | string[] | null;
}>(options: T): T;
export declare function resolveDefaultCellForType(type: string, typeOptions: unknown): unknown | null;
export declare function backfillDefaultForTypeChange(fromType: string, toType: string, clearMode: boolean, toTypeOptions: unknown): unknown | null;
export declare function buildDefaultCells(properties: {
    id: string;
    type: string;
    typeOptions: unknown;
    pendingType?: string | null;
}[], providedCells: Record<string, unknown>): Record<string, unknown>;
