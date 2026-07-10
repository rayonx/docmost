import { KyselyDB } from "../../database/types/kysely.types";
import { CreateApiKeyDto } from "./dto/api-key.dto";
import { JwtApiKeyPayload } from '../../core/auth/dto/jwt-payload';
import { WorkspaceRepo } from "../../database/repos/workspace/workspace.repo";
import { UserRepo } from "../../database/repos/user/user.repo";
import { TokenService } from '../../core/auth/services/token.service';
import { User } from "../../database/types/entity.types";
import { PaginationOptions } from "../../database/pagination/pagination-options";
import { ExpressionBuilder } from 'kysely';
import { DB } from '@docmost/db/types/db';
import { IAuditService } from '../../integrations/audit/audit.service';
export declare class ApiKeyService {
    private readonly db;
    private readonly workspaceRepo;
    private userRepo;
    private readonly tokenService;
    private readonly auditService;
    constructor(db: KyselyDB, workspaceRepo: WorkspaceRepo, userRepo: UserRepo, tokenService: TokenService, auditService: IAuditService);
    createApiKey(user: User, workspaceId: string, createApiKeyDto: CreateApiKeyDto): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        name: string;
        expiresAt: Date;
        lastUsedAt: Date;
        token: string;
    }>;
    getApiKeys(opts: {
        userId?: string;
        workspaceId: string;
        pagination: PaginationOptions;
    }): Promise<import("@docmost/db/pagination/cursor-pagination").CursorPaginationResult<{
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        name: string;
        expiresAt: Date;
        lastUsedAt: Date;
    } & {
        creator: {
            id: string;
            name: string;
            avatarUrl: string;
        };
    }, undefined>>;
    findById(apiKeyId: string): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        name: string;
        expiresAt: Date;
        lastUsedAt: Date;
    }>;
    updateApiKey(apiKeyId: string, name: string): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        name: string;
        expiresAt: Date;
        lastUsedAt: Date;
    }[]>;
    updateLastUsedAt(apiKeyId: string): Promise<void>;
    revokeApiKey(apiKeyId: string): Promise<void>;
    withCreator(eb: ExpressionBuilder<DB, 'apiKeys'>): import("kysely").AliasedRawBuilder<{
        id: string;
        name: string;
        avatarUrl: string;
    }, "creator">;
    validateApiKey(payload: JwtApiKeyPayload): Promise<{
        user: {
            password: string;
            id: string;
            workspaceId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            role: string;
            name: string;
            settings: import("@docmost/db/types/db").JsonValue;
            email: string;
            invitedById: string;
            avatarUrl: string;
            deactivatedAt: Date;
            emailVerifiedAt: Date;
            lastActiveAt: Date;
            lastLoginAt: Date;
            locale: string;
            hasGeneratedPassword: boolean;
            scimExternalId: string;
            timezone: string;
        };
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
            settings: import("@docmost/db/types/db").JsonValue;
            status: string;
            stripeCustomerId: string;
            trialEndAt: Date;
        };
    }>;
}
