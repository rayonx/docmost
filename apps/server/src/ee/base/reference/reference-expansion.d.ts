import type { KyselyDB } from "../../../database/types/kysely.types";
import type { ResolvedPage } from '../services/base-page-resolver.service';
export type UserRef = {
    id: string;
    name: string | null;
    avatarUrl: string | null;
};
export type RowReferences = {
    users: Record<string, UserRef>;
    pages: Record<string, ResolvedPage>;
};
export type RowLike = {
    cells: Record<string, unknown> | null;
    lastUpdatedById: string | null;
    creatorId: string | null;
};
type PropertyLike = {
    id: string;
    type: string;
};
export declare function collectReferenceIds(rows: RowLike[], properties: PropertyLike[]): {
    userIds: Set<string>;
    pageIds: Set<string>;
};
export declare function loadUserRefs(db: KyselyDB, userIds: Set<string>, workspaceId: string): Promise<Record<string, UserRef>>;
export declare function buildRowReferences(args: {
    db: KyselyDB;
    rows: RowLike[];
    properties: PropertyLike[];
    workspaceId: string;
    userId: string;
    resolvePages: (pageIds: string[], workspaceId: string, userId: string) => Promise<ResolvedPage[]>;
}): Promise<RowReferences>;
export {};
