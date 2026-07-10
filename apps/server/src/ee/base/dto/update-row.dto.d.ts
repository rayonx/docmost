export declare class UpdateRowDto {
    rowId: string;
    pageId: string;
    cells: Record<string, unknown>;
    position?: string;
    requestId?: string;
}
export declare class DeleteRowDto {
    rowId: string;
    pageId: string;
    requestId?: string;
}
export declare class RowIdDto {
    rowId: string;
    pageId: string;
}
declare class SortDto {
    propertyId: string;
    direction: 'asc' | 'desc';
}
export declare class ListRowsDto {
    pageId: string;
    filter?: unknown;
    sorts?: SortDto[];
}
export declare class CountRowsDto {
    pageId: string;
    filter?: unknown;
}
export declare class GroupCountsDto {
    pageId: string;
    groupByPropertyId: string;
    filter?: unknown;
}
export declare class ReorderRowDto {
    rowId: string;
    pageId: string;
    position: string;
    requestId?: string;
}
export declare class DeleteRowsDto {
    pageId: string;
    rowIds: string[];
    requestId?: string;
}
export {};
