import { KyselyDB, KyselyTransaction } from "../../database/types/kysely.types";
import { PagePermissionMember, PagePermissionRepo } from "../../database/repos/page/page-permission.repo";
import { PageRepo } from "../../database/repos/page/page.repo";
import { AddPagePermissionDto, RemovePagePermissionDto, UpdatePagePermissionRoleDto } from './dto/page-permission.dto';
import { Page, User } from "../../database/types/entity.types";
import { PaginationOptions } from "../../database/pagination/pagination-options";
import { Queue } from 'bullmq';
import SpaceAbilityFactory from '../../core/casl/abilities/space-ability.factory';
import { CursorPaginationResult } from "../../database/pagination/cursor-pagination";
import { WsService } from '../../ws/ws.service';
import { WsTreeService } from '../../ws/ws-tree.service';
import { IAuditService } from '../../integrations/audit/audit.service';
export type PageRestrictionInfo = {
    restrictionId?: string;
    hasDirectRestriction: boolean;
    hasInheritedRestriction: boolean;
    inheritedFrom?: {
        id: string;
        slugId: string;
        title: string;
    };
    userAccess: {
        canView: boolean;
        canEdit: boolean;
        canManage: boolean;
    };
};
export declare class PagePermissionService {
    private pagePermissionRepo;
    private pageRepo;
    private spaceAbility;
    private wsService;
    private wsTreeService;
    private readonly db;
    private notificationQueue;
    private readonly auditService;
    constructor(pagePermissionRepo: PagePermissionRepo, pageRepo: PageRepo, spaceAbility: SpaceAbilityFactory, wsService: WsService, wsTreeService: WsTreeService, db: KyselyDB, notificationQueue: Queue, auditService: IAuditService);
    restrictPage(pageId: string, authUser: User, workspaceId: string): Promise<void>;
    addPagePermissions(dto: AddPagePermissionDto, authUser: User, workspaceId: string): Promise<void>;
    removePagePermissions(dto: RemovePagePermissionDto, authUser: User): Promise<void>;
    updatePagePermissionRole(dto: UpdatePagePermissionRoleDto, authUser: User): Promise<void>;
    removePageRestriction(pageId: string, authUser: User): Promise<void>;
    getPagePermissions(pageId: string, authUser: User, pagination: PaginationOptions): Promise<CursorPaginationResult<PagePermissionMember>>;
    getPageRestrictionInfo(pageId: string, authUser: User): Promise<PageRestrictionInfo>;
    private computeCanManage;
    validateLastWriter(pageAccessId: string, opts?: {
        trx?: KyselyTransaction;
    }): Promise<void>;
    validateWriteAccess(page: Page, user: User): Promise<void>;
    canViewPage(userId: string, pageId: string): Promise<boolean>;
    canEditPage(userId: string, pageId: string): Promise<{
        hasAnyRestriction: boolean;
        canAccess: boolean;
        canEdit: boolean;
    }>;
}
