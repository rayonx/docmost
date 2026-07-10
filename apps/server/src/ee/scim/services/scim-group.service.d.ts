import { Workspace } from "../../../database/types/entity.types";
import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
import { GroupRepo } from "../../../database/repos/group/group.repo";
import { GroupUserService } from '../../../core/group/services/group-user.service';
export declare class ScimGroupService {
    private readonly groupRepo;
    private readonly groupUserService;
    private readonly db;
    private readonly logger;
    constructor(groupRepo: GroupRepo, groupUserService: GroupUserService, db: KyselyDB);
    handleGetGroup(groupId: string, workspace: Workspace): Promise<any>;
    handleGetGroups(resource: any, workspace: Workspace): Promise<any>;
    handleCreateGroup(data: any, workspace: Workspace): Promise<any>;
    handleUpdateGroup(groupId: string, data: any, workspace: Workspace): Promise<any>;
    handleDeleteGroup(groupId: string, workspace: Workspace): Promise<void>;
    getUsersForGroup(groupId: string): Promise<{
        id: string;
        email: string;
    }[]>;
    getUsersForGroups(groupIds: string[]): Promise<Map<string, {
        id: string;
        email: string;
    }[]>>;
    removeUsersFromGroupBatch(userIds: string[], groupId: string, workspaceId: string, trx?: KyselyTransaction): Promise<void>;
}
