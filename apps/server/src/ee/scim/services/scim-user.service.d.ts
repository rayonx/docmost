import { Workspace } from "../../../database/types/entity.types";
import { UserRepo } from "../../../database/repos/user/user.repo";
import { KyselyDB } from "../../../database/types/kysely.types";
import { GroupUserRepo } from "../../../database/repos/group/group-user.repo";
export declare class ScimUserService {
    private readonly userRepo;
    private readonly groupUserRepo;
    private readonly db;
    private readonly logger;
    constructor(userRepo: UserRepo, groupUserRepo: GroupUserRepo, db: KyselyDB);
    handleGetUser(userId: string, workspace: Workspace): Promise<any>;
    handleGetUsers(resource: any, workspace: Workspace): Promise<any>;
    handleCreateUser(data: any, workspace: Workspace): Promise<any>;
    handleUpdateUser(userId: any, data: any, workspace: Workspace): Promise<any>;
    handleDeleteUser(userId: string, workspace: Workspace): Promise<void>;
}
