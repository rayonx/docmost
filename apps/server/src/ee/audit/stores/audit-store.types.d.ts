import { AuditLogData } from '../../../common/events/audit-events';
import { AuditLogFilters } from './postgres-audit.store';
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { CursorPaginationResult } from "../../../database/pagination/cursor-pagination";
export declare const AUDIT_STORE = "AUDIT_STORE";
export type AuditStoreRow = {
    id: string;
    workspaceId: string;
    actorId: string | null;
    actorType: string;
    event: string;
    resourceType: string;
    resourceId: string | null;
    spaceId: string | null;
    changes: Record<string, any> | null;
    metadata: Record<string, any> | null;
    ipAddress: string | null;
    createdAt: Date;
};
export type IAuditStore = {
    insert(data: AuditLogData): Promise<void>;
    insertBatch(data: AuditLogData[]): Promise<void>;
    findByWorkspace(workspaceId: string, filters: AuditLogFilters, pagination: PaginationOptions): Promise<CursorPaginationResult<AuditStoreRow>>;
    deleteOlderThan(days: number, workspaceId: string): Promise<number>;
};
