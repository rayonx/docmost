import { PageVerificationService } from './page-verification.service';
import { ListVerificationsDto, ObsoletePageDto, PageVerificationPageIdDto, RejectApprovalDto, RemoveVerificationDto, SetupVerificationDto, SubmitForApprovalDto, UpdateVerificationDto, VerifyPageDto } from './dto/page-verification.dto';
import { PaginationOptions } from "../../database/pagination/pagination-options";
import { User, Workspace } from "../../database/types/entity.types";
export declare class PageVerificationController {
    private readonly pageVerificationService;
    constructor(pageVerificationService: PageVerificationService);
    verifications(dto: ListVerificationsDto, pagination: PaginationOptions, user: User, workspace: Workspace): Promise<{
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
    setupVerification(dto: SetupVerificationDto, user: User, workspace: Workspace): Promise<{
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
    updateVerification(dto: UpdateVerificationDto, user: User, workspace: Workspace): Promise<void>;
    verifyPage(dto: VerifyPageDto, user: User, workspace: Workspace): Promise<void>;
    getVerificationInfo(dto: PageVerificationPageIdDto, user: User, workspace: Workspace): Promise<{
        status: import("./page-verification.service").VerificationStatus;
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
        status: import("./page-verification.service").VerificationStatus;
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
    removeVerification(dto: RemoveVerificationDto, user: User, workspace: Workspace): Promise<void>;
    submitForApproval(dto: SubmitForApprovalDto, user: User, workspace: Workspace): Promise<void>;
    rejectApproval(dto: RejectApprovalDto, user: User, workspace: Workspace): Promise<void>;
    markObsolete(dto: ObsoletePageDto, user: User, workspace: Workspace): Promise<void>;
}
