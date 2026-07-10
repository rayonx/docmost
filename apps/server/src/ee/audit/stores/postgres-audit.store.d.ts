import { KyselyDB } from "../../../database/types/kysely.types";
import { AuditLogData } from '../../../common/events/audit-events';
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { CursorPaginationResult } from "../../../database/pagination/cursor-pagination";
import { IAuditStore, AuditStoreRow } from './audit-store.types';
export interface AuditLogFilters {
    event?: string;
    resourceType?: string;
    resourceId?: string;
    actorId?: string;
    spaceId?: string;
    startDate?: string;
    endDate?: string;
}
export declare class PostgresAuditStore implements IAuditStore {
    private readonly db;
    constructor(db: KyselyDB);
    insert(data: AuditLogData): Promise<void>;
    insertBatch(data: AuditLogData[]): Promise<void>;
    findByWorkspace(workspaceId: string, filters: AuditLogFilters, pagination: PaginationOptions): Promise<CursorPaginationResult<AuditStoreRow>>;
    deleteOlderThan(days: number, workspaceId: string): Promise<number>;
}
