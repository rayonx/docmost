import { WorkspaceCloudService } from "../services/workspace.cloud.service";
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateCloudWorkspaceDto } from "../dto/create-workspace.dto";
import { FindWorkspaceByEmailDto } from "../dto/find-workspace-by-email.dto";
import { ResendVerificationDto } from "../dto/resend-verification.dto";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import { Workspace } from "../../../database/types/entity.types";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
export declare class WorkspaceCloudController {
    private readonly workspaceCloudService;
    private readonly environmentService;
    constructor(workspaceCloudService: WorkspaceCloudService, environmentService: EnvironmentService);
    create(dto: CreateCloudWorkspaceDto): Promise<{
        workspace: {
            hostname: string;
            description: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            auditRetentionDays: number;
            trashRetentionDays: number;
            billingEmail: string;
            customDomain: string;
            defaultRole: string;
            defaultSpaceId: string;
            emailDomains: string[];
            enforceMfa: boolean;
            enforceSso: boolean;
            isScimEnabled: boolean;
            licenseKey: string;
            logo: string;
            name: string;
            plan: string;
            settings: import("../../../database/types/db").JsonValue;
            status: string;
            stripeCustomerId: string;
            trialEndAt: Date;
        };
        requiresEmailVerification: boolean;
        emailSignature: string;
    }>;
    getJoinWorkspaces(req: FastifyRequest): Promise<{
        hostname: string;
        id: string;
        logo: string;
        name: string;
    }[]>;
    findByEmail(dto: FindWorkspaceByEmailDto): Promise<void>;
    verifyEmail(dto: VerifyEmailDto, workspace: Workspace, res: FastifyReply): Promise<void>;
    resendVerification(dto: ResendVerificationDto, workspace: Workspace): Promise<void>;
}
