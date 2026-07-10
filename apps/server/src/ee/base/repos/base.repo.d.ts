import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
import { Page } from "../../../database/types/entity.types";
import { PaginationOptions } from "../../../database/pagination/pagination-options";
export type BasePage = Page & {
    properties?: unknown[];
    views?: unknown[];
};
export declare class BaseRepo {
    private readonly db;
    constructor(db: KyselyDB);
    findById(pageId: string, opts?: {
        includeProperties?: boolean;
        includeViews?: boolean;
        trx?: KyselyTransaction;
    }): Promise<BasePage | undefined>;
    findBySpaceId(spaceId: string, pagination: PaginationOptions, opts?: {
        trx?: KyselyTransaction;
    }): Promise<import("@docmost/db/pagination/cursor-pagination").CursorPaginationResult<{
        id: string;
        workspaceId: string;
        creatorId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        spaceId: string;
        contributorIds: string[];
        coverPhoto: string;
        deletedById: string;
        icon: string;
        isBase: boolean;
        baseSchemaVersion: number;
        isLocked: boolean;
        lastUpdatedById: string;
        parentPageId: string;
        position: string;
        slugId: string;
    }, undefined>>;
    softDelete(pageId: string, trx?: KyselyTransaction): Promise<void>;
    bumpSchemaVersion(pageId: string, trx?: KyselyTransaction): Promise<number>;
    private withProperties;
    private withViews;
}
