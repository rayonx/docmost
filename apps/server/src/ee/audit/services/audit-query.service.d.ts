import { KyselyDB } from "../../../database/types/kysely.types";
import { AuditLogFilters } from '../stores/postgres-audit.store';
import { IAuditStore } from '../stores/audit-store.types';
import { PaginationOptions } from "../../../database/pagination/pagination-options";
export declare class AuditQueryService {
    private readonly auditStore;
    private readonly db;
    constructor(auditStore: IAuditStore, db: KyselyDB);
    findByWorkspace(workspaceId: string, filters: AuditLogFilters, pagination: PaginationOptions): Promise<import("../../../database/pagination/cursor-pagination").CursorPaginationResult<import("../stores/audit-store.types").AuditStoreRow>>;
    getRetention(workspaceId: string): Promise<number>;
    updateRetention(workspaceId: string, retentionDays: number): Promise<void>;
    private resolveActors;
    private resolveResources;
}
