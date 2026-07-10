import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
import { BaseView, InsertableBaseView, UpdatableBaseView } from "../../../database/types/entity.types";
type RepoOpts = {
    trx?: KyselyTransaction;
};
type WorkspaceOpts = {
    workspaceId: string;
} & RepoOpts;
export declare class BaseViewRepo {
    private readonly db;
    constructor(db: KyselyDB);
    findById(viewId: string, opts: WorkspaceOpts): Promise<BaseView | undefined>;
    findByPageId(pageId: string, opts: WorkspaceOpts): Promise<BaseView[]>;
    lockViewIdsByPageId(pageId: string, opts: WorkspaceOpts): Promise<string[]>;
    getLastPosition(pageId: string, opts: WorkspaceOpts): Promise<string | null>;
    insertView(view: InsertableBaseView, opts?: RepoOpts): Promise<BaseView>;
    updateView(viewId: string, data: UpdatableBaseView, opts: WorkspaceOpts): Promise<void>;
    deleteView(viewId: string, opts: WorkspaceOpts): Promise<void>;
}
export {};
