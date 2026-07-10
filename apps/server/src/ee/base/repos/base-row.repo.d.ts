import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
import { BaseRow, InsertableBaseRow } from "../../../database/types/entity.types";
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { CursorPaginationResult } from "../../../database/pagination/cursor-pagination";
import { FilterNode, PropertySchema, SortSpec } from '../engine';
type RepoOpts = {
    trx?: KyselyTransaction;
};
type WorkspaceOpts = {
    workspaceId: string;
} & RepoOpts;
export declare class BaseRowRepo {
    private readonly db;
    constructor(db: KyselyDB);
    findById(rowId: string, opts: WorkspaceOpts & {
        forUpdate?: boolean;
    }): Promise<BaseRow | undefined>;
    findByIds(rowIds: string[], opts: WorkspaceOpts): Promise<BaseRow[]>;
    list(opts: {
        pageId: string;
        workspaceId: string;
        filter?: FilterNode;
        sorts?: SortSpec[];
        schema: PropertySchema;
        pagination: PaginationOptions;
        trx?: KyselyTransaction;
    }): Promise<CursorPaginationResult<BaseRow>>;
    count(opts: {
        pageId: string;
        workspaceId: string;
        filter?: FilterNode;
        schema: PropertySchema;
        trx?: KyselyTransaction;
    }): Promise<number>;
    groupCounts(opts: {
        pageId: string;
        workspaceId: string;
        groupByPropertyId: string;
        filter?: FilterNode;
        schema: PropertySchema;
        trx?: KyselyTransaction;
    }): Promise<Array<{
        value: string | null;
        count: number;
    }>>;
    getLastPosition(pageId: string, opts: WorkspaceOpts): Promise<string | null>;
    getNextPosition(pageId: string, after: {
        position: string;
        id: string;
    }, opts: WorkspaceOpts): Promise<string | null>;
    insertRow(row: InsertableBaseRow, opts?: RepoOpts): Promise<BaseRow>;
    updateCells(rowId: string, patch: Record<string, unknown>, opts: {
        pageId: string;
        workspaceId: string;
        actorId?: string;
        position?: string;
        trx?: KyselyTransaction;
    }): Promise<BaseRow | undefined>;
    updatePosition(rowId: string, position: string, opts: {
        pageId: string;
        workspaceId: string;
        trx?: KyselyTransaction;
    }): Promise<void>;
    deleteRow(rowId: string, opts: {
        pageId: string;
        workspaceId: string;
        trx?: KyselyTransaction;
    }): Promise<void>;
    deleteRows(rowIds: string[], opts: {
        pageId: string;
        workspaceId: string;
        trx?: KyselyTransaction;
    }): Promise<void>;
    removeCellKey(pageId: string, propertyId: string, opts: WorkspaceOpts): Promise<void>;
    removeCellKeyByIds(rowIds: string[], propertyId: string, opts: {
        pageId: string;
        workspaceId: string;
        trx?: KyselyTransaction;
    }): Promise<void>;
    streamByPageId(pageId: string, opts: {
        workspaceId: string;
        chunkSize?: number;
        trx?: KyselyTransaction;
        withCellKey?: string;
    }): AsyncGenerator<BaseRow[], void, void>;
    batchUpdateCells(updates: Array<{
        id: string;
        patch: Record<string, unknown>;
    }>, opts: {
        pageId: string;
        workspaceId: string;
        actorId?: string;
        trx?: KyselyTransaction;
    }): Promise<void>;
    seedEmptyCells(propertyId: string, value: unknown, opts: {
        pageId: string;
        workspaceId: string;
        trx?: KyselyTransaction;
    }): Promise<void>;
}
export {};
