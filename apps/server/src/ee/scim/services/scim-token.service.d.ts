import { KyselyDB } from "../../../database/types/kysely.types";
import { ScimToken, User } from "../../../database/types/entity.types";
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { IAuditService } from '../../../integrations/audit/audit.service';
export declare class ScimTokenService {
    private readonly db;
    private readonly environmentService;
    private readonly auditService;
    constructor(db: KyselyDB, environmentService: EnvironmentService, auditService: IAuditService);
    createToken(user: User, workspaceId: string, name: string): Promise<{
        token: string;
        scimToken: ScimToken;
    }>;
    getTokens(opts: {
        workspaceId: string;
        pagination: PaginationOptions;
    }): Promise<import("@docmost/db/pagination/cursor-pagination").CursorPaginationResult<{
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isEnabled: boolean;
        lastUsedAt: Date;
        tokenLastFour: string;
    } & {
        creator: {
            id: string;
            name: string;
            avatarUrl: string;
        };
    }, undefined>>;
    findById(tokenId: string, workspaceId: string): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        name: string;
        isEnabled: boolean;
        lastUsedAt: Date;
        tokenHash: string;
        tokenLastFour: string;
    }>;
    revokeToken(tokenId: string, workspaceId: string): Promise<void>;
    validateBearerToken(bearerToken: string, workspaceId: string): Promise<ScimToken>;
    private updateLastUsedAt;
    private withCreator;
}
