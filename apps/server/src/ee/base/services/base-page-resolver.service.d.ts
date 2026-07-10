import { KyselyDB } from "../../../database/types/kysely.types";
import { PagePermissionRepo } from "../../../database/repos/page/page-permission.repo";
import { SpaceMemberRepo } from "../../../database/repos/space/space-member.repo";
export type ResolvedPage = {
    id: string;
    slugId: string;
    title: string | null;
    icon: string | null;
    spaceId: string;
    space: {
        id: string;
        slug: string;
        name: string;
    } | null;
};
export declare class BasePageResolverService {
    private readonly db;
    private readonly pagePermissionRepo;
    private readonly spaceMemberRepo;
    constructor(db: KyselyDB, pagePermissionRepo: PagePermissionRepo, spaceMemberRepo: SpaceMemberRepo);
    resolvePages(pageIds: string[], workspaceId: string, userId: string): Promise<ResolvedPage[]>;
}
