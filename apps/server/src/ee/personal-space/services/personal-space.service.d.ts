import { SpaceService } from '../../../core/space/services/space.service';
import { SpaceRepo } from "../../../database/repos/space/space.repo";
import { FavoriteService } from '../../../core/favorite/services/favorite.service';
import { Space, User, Workspace } from "../../../database/types/entity.types";
export declare class PersonalSpaceService {
    private readonly spaceService;
    private readonly spaceRepo;
    private readonly favoriteService;
    private readonly logger;
    constructor(spaceService: SpaceService, spaceRepo: SpaceRepo, favoriteService: FavoriteService);
    findForUser(userId: string, workspaceId: string): Promise<Space | null>;
    createForUser(user: User, workspace: Workspace, name?: string): Promise<Space>;
    private insertPersonalSpace;
    private generateUniqueSlug;
    private isSettingEnabled;
    private isPersonalSpaceConflict;
}
