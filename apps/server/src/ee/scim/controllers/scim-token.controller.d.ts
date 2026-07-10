import { User, Workspace } from "../../../database/types/entity.types";
import { ScimTokenService } from '../services/scim-token.service';
import { CreateScimTokenDto, RevokeScimTokenDto } from '../dto/scim-token.dto';
import WorkspaceAbilityFactory from '../../../core/casl/abilities/workspace-ability.factory';
import { PaginationOptions } from "../../../database/pagination/pagination-options";
export declare class ScimTokenController {
    private readonly scimTokenService;
    private readonly workspaceAbility;
    constructor(scimTokenService: ScimTokenService, workspaceAbility: WorkspaceAbilityFactory);
    getTokens(pagination: PaginationOptions, user: User, workspace: Workspace): Promise<import("../../../database/pagination/cursor-pagination").CursorPaginationResult<{
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
    createToken(dto: CreateScimTokenDto, user: User, workspace: Workspace): Promise<{
        token: string;
        id: string;
        name: string;
        tokenLastFour: string;
        isEnabled: boolean;
        createdAt: Date;
    }>;
    revokeToken(dto: RevokeScimTokenDto, user: User, workspace: Workspace): Promise<void>;
    private assertManageSettings;
}
