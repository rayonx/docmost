import { KyselyDB } from "../../database/types/kysely.types";
import { PageVerificationRepo } from './page-verification.repo';
import { PageVerificationSchedulerService } from './page-verification-scheduler.service';
import { PageRepo } from "../../database/repos/page/page.repo";
import { ListVerificationsDto, SetupVerificationDto, UpdateVerificationDto } from './dto/page-verification.dto';
import { PaginationOptions } from "../../database/pagination/pagination-options";
import { User } from "../../database/types/entity.types";
import { Queue } from 'bullmq';
import SpaceAbilityFactory from '../../core/casl/abilities/space-ability.factory';
import { IAuditService } from '../../integrations/audit/audit.service';
import { PageAccessService } from '../../core/page/page-access/page-access.service';
import { WsService } from '../../ws/ws.service';
export declare enum VerificationStatus {
    VERIFIED = "verified",
    EXPIRING = "expiring",
    EXPIRED = "expired",
    DRAFT = "draft",
    IN_APPROVAL = "in_approval",
    APPROVED = "approved",
    OBSOLETE = "obsolete",
    NONE = "none"
}
export declare class PageVerificationService {
    private readonly verificationRepo;
    private readonly pageRepo;
    private readonly spaceAbility;
    private readonly pageAccessService;
    private readonly wsService;
    private readonly scheduler;
    private readonly db;
    private notificationQueue;
    private readonly auditService;
    constructor(verificationRepo: PageVerificationRepo, pageRepo: PageRepo, spaceAbility: SpaceAbilityFactory, pageAccessService: PageAccessService, wsService: WsService, scheduler: PageVerificationSchedulerService, db: KyselyDB, notificationQueue: Queue, auditService: IAuditService);
    setupVerification(dto: SetupVerificationDto, authUser: User, workspaceId: string): Promise<{
        type: string;
        data: import("../../database/types/db").JsonValue;
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        spaceId: string;
        pageId: string;
        expiresAt: Date;
        mode: string;
        periodAmount: number;
        periodUnit: string;
        verifiedAt: Date;
        verifiedById: string;
        requestedAt: Date;
        requestedById: string;
        rejectedAt: Date;
        rejectedById: string;
        rejectionComment: string;
    }>;
    verifyPage(pageId: string, authUser: User, workspaceId: string): Promise<void>;
    submitForApproval(pageId: string, authUser: User, workspaceId: string): Promise<void>;
    rejectApproval(pageId: string, comment: string | undefined, authUser: User, workspaceId: string): Promise<void>;
    markObsolete(pageId: string, authUser: User, workspaceId: string): Promise<void>;
    updateVerification(dto: UpdateVerificationDto, authUser: User, workspaceId: string): Promise<void>;
    removeVerification(pageId: string, authUser: User, workspaceId: string): Promise<void>;
    getVerificationInfo(pageId: string, authUser: User, workspaceId: string): Promise<{
        status: VerificationStatus;
        id?: undefined;
        pageId?: undefined;
        type?: undefined;
        mode?: undefined;
        periodAmount?: undefined;
        periodUnit?: undefined;
        verifiedAt?: undefined;
        verifiedBy?: undefined;
        expiresAt?: undefined;
        requestedAt?: undefined;
        requestedBy?: undefined;
        rejectedAt?: undefined;
        rejectedBy?: undefined;
        rejectionComment?: undefined;
        verifiers?: undefined;
        permissions?: undefined;
    } | {
        id: string;
        pageId: string;
        type: string;
        mode: string;
        periodAmount: number;
        periodUnit: string;
        status: VerificationStatus;
        verifiedAt: Date;
        verifiedBy: {
            id: string;
            name: string;
            avatarUrl: string;
        };
        expiresAt: Date;
        requestedAt: Date;
        requestedBy: {
            id: string;
            name: string;
            avatarUrl: string;
        };
        rejectedAt: Date;
        rejectedBy: {
            id: string;
            name: string;
            avatarUrl: string;
        };
        rejectionComment: string;
        verifiers: {
            id: string;
            name: string;
            avatarUrl: string;
            email: string;
        }[];
        permissions: {
            canVerify: boolean;
            canManage: boolean;
            canSubmitForApproval: boolean;
            canMarkObsolete: boolean;
        };
    }>;
    listVerifications(dto: ListVerificationsDto, pagination: PaginationOptions, authUser: User, workspaceId: string): Promise<{
        items: {
            status: string;
            verifiers: {
                id: any;
                name: any;
                avatarUrl: any;
            }[];
            type: string;
            id: string;
            createdAt: Date;
            spaceId: string;
            pageId: string;
            expiresAt: Date;
            mode: string;
            periodAmount: number;
            periodUnit: string;
            verifiedAt: Date;
            spaceSlug: string;
            pageTitle: string;
            pageSlugId: string;
            pageIcon: string;
            spaceName: string;
        }[];
        meta: {
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            nextCursor: string | null;
            prevCursor: string | null;
        };
    }>;
    private computeExpiresAt;
    private validateExpirationInput;
    private computeExpiringStatus;
    private resolveUserRef;
    private emitVerificationUpdate;
    private validateWorkspaceMembers;
}
