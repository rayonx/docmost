import { User, Workspace } from "../../database/types/entity.types";
import { ApiKeyService } from "./api-key.service";
import { CreateApiKeyDto, RevokeApiKeyDto, UpdateApiKeyDto } from "./dto/api-key.dto";
import WorkspaceAbilityFactory from '../../core/casl/abilities/workspace-ability.factory';
import { PaginationOptions } from "../../database/pagination/pagination-options";
export declare class ApiKeyController {
    private readonly apiKeyService;
    private readonly workspaceAbility;
    constructor(apiKeyService: ApiKeyService, workspaceAbility: WorkspaceAbilityFactory);
    getApiKeys(pagination: PaginationOptions, user: User, workspace: Workspace): Promise<import("../../database/pagination/cursor-pagination").CursorPaginationResult<{
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
    createApiKey(dto: CreateApiKeyDto, user: User, workspace: Workspace): Promise<{
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
    updateApiKey(dto: UpdateApiKeyDto, user: User, workspace: Workspace): Promise<{
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
    revokeApiKey(dto: RevokeApiKeyDto, user: User, workspace: Workspace): Promise<void>;
}
