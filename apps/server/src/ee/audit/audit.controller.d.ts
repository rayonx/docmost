import { AuditService } from './services/audit.service';
import { AuditQueryService } from './services/audit-query.service';
import { ListAuditLogsDto, UpdateAuditRetentionDto } from './dto/audit-log.dto';
import { User, Workspace } from "../../database/types/entity.types";
import { PaginationOptions } from "../../database/pagination/pagination-options";
import WorkspaceAbilityFactory from '../../core/casl/abilities/workspace-ability.factory';
import { EnvironmentService } from '../../integrations/environment/environment.service';
export declare class AuditController {
    private readonly auditService;
    private readonly auditQueryService;
    private readonly workspaceAbility;
    private readonly environmentService;
    constructor(auditService: AuditService, auditQueryService: AuditQueryService, workspaceAbility: WorkspaceAbilityFactory, environmentService: EnvironmentService);
    listAuditLogs(dto: ListAuditLogsDto, pagination: PaginationOptions, user: User, workspace: Workspace): Promise<import("../../database/pagination/cursor-pagination").CursorPaginationResult<import("./stores/audit-store.types").AuditStoreRow>>;
    getRetention(user: User, workspace: Workspace): Promise<{
        retentionDays: number;
    }>;
    updateRetention(dto: UpdateAuditRetentionDto, user: User, workspace: Workspace): Promise<{
        retentionDays: number;
    }>;
}
