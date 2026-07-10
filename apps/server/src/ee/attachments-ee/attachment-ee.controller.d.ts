import { User, Workspace } from "../../database/types/entity.types";
import { AttachmentEeService } from "./attachment-ee.service";
import SpaceAbilityFactory from '../../core/casl/abilities/space-ability.factory';
import { SearchDTO } from '../../core/search/dto/search.dto';
import WorkspaceAbilityFactory from '../../core/casl/abilities/workspace-ability.factory';
export declare class AttachmentEeController {
    private readonly attachmentEeService;
    private readonly spaceAbility;
    private readonly workspaceAbility;
    constructor(attachmentEeService: AttachmentEeService, spaceAbility: SpaceAbilityFactory, workspaceAbility: WorkspaceAbilityFactory);
    searchAttachments(searchDto: SearchDTO, user: User, workspace: Workspace): Promise<{
        items: import("../../core/search/dto/search-response.dto").SearchResponseDto[];
    }>;
    indexAttachments(user: User, workspace: Workspace): Promise<void>;
}
