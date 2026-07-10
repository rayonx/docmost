import { BaseRowService } from '../services/base-row.service';
import { BaseRepo } from "../repos/base.repo";
import { CreateRowDto } from '../dto/create-row.dto';
import { UpdateRowDto, DeleteRowDto, DeleteRowsDto, RowIdDto, ListRowsDto, ReorderRowDto } from '../dto/update-row.dto';
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { User, Workspace } from "../../../database/types/entity.types";
import { BaseAccessCacheService } from '../services/base-access-cache.service';
export declare class BaseRowController {
    private readonly baseRowService;
    private readonly baseRepo;
    private readonly baseAccessCache;
    constructor(baseRowService: BaseRowService, baseRepo: BaseRepo, baseAccessCache: BaseAccessCacheService);
    create(dto: CreateRowDto, user: User, workspace: Workspace): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        lastUpdatedById: string;
        position: string;
        pageId: string;
        cells: string | number | boolean | import("../../../database/types/db").JsonArray | import("../../../database/types/db").JsonObject;
    }>;
    getRow(dto: RowIdDto, user: User, workspace: Workspace): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        lastUpdatedById: string;
        position: string;
        pageId: string;
        cells: string | number | boolean | import("../../../database/types/db").JsonArray | import("../../../database/types/db").JsonObject;
    }>;
    update(dto: UpdateRowDto, user: User, workspace: Workspace): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        lastUpdatedById: string;
        position: string;
        pageId: string;
        cells: string | number | boolean | import("../../../database/types/db").JsonArray | import("../../../database/types/db").JsonObject;
    }>;
    delete(dto: DeleteRowDto, user: User, workspace: Workspace): Promise<void>;
    deleteMany(dto: DeleteRowsDto, user: User, workspace: Workspace): Promise<void>;
    list(dto: ListRowsDto, pagination: PaginationOptions, user: User, workspace: Workspace): Promise<{
        references: import("../reference/reference-expansion").RowReferences;
        meta: {
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            nextCursor: string | null;
            prevCursor: string | null;
        };
        items: ({
            id: string;
            workspaceId: string;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            lastUpdatedById: string;
            position: string;
            pageId: string;
            cells: string | number | boolean | import("../../../database/types/db").JsonArray | import("../../../database/types/db").JsonObject;
        } & {})[];
    }>;
    reorder(dto: ReorderRowDto, user: User, workspace: Workspace): Promise<void>;
}
