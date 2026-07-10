import { EventEmitter2 } from '@nestjs/event-emitter';
import { KyselyDB } from "../../../database/types/kysely.types";
import { BaseRowRepo } from "../repos/base-row.repo";
import { BaseViewRepo } from "../repos/base-view.repo";
import { CreateRowDto } from '../dto/create-row.dto';
import { UpdateRowDto, DeleteRowDto, DeleteRowsDto, ListRowsDto, ReorderRowDto, CountRowsDto, GroupCountsDto } from '../dto/update-row.dto';
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { FormulaService } from '../formula/formula.service';
import { BasePageResolverService } from './base-page-resolver.service';
import { BaseSchemaCacheService } from './base-schema-cache.service';
export declare class BaseRowService {
    private readonly db;
    private readonly baseRowRepo;
    private readonly baseViewRepo;
    private readonly eventEmitter;
    private readonly formulaService;
    private readonly basePageResolver;
    private readonly baseSchemaCache;
    constructor(db: KyselyDB, baseRowRepo: BaseRowRepo, baseViewRepo: BaseViewRepo, eventEmitter: EventEmitter2, formulaService: FormulaService, basePageResolver: BasePageResolverService, baseSchemaCache: BaseSchemaCacheService);
    create(userId: string, workspaceId: string, dto: CreateRowDto, schemaVersion: number): Promise<{
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
    getRowInfo(rowId: string, pageId: string, workspaceId: string): Promise<{
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
    update(dto: UpdateRowDto, workspaceId: string, userId: string | undefined, schemaVersion: number): Promise<{
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
    delete(dto: DeleteRowDto, workspaceId: string, userId?: string): Promise<void>;
    deleteMany(dto: DeleteRowsDto, workspaceId: string, userId?: string): Promise<void>;
    list(dto: ListRowsDto, pagination: PaginationOptions, workspaceId: string, userId: string, schemaVersion: number): Promise<{
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
    count(dto: CountRowsDto, workspaceId: string, schemaVersion: number): Promise<{
        count: number;
    }>;
    groupCounts(dto: GroupCountsDto, workspaceId: string, schemaVersion: number): Promise<{
        counts: {
            value: string | null;
            count: number;
        }[];
    }>;
    reorder(dto: ReorderRowDto, workspaceId: string, userId?: string): Promise<void>;
    private normaliseFilter;
    private normaliseSorts;
    private validateCells;
}
