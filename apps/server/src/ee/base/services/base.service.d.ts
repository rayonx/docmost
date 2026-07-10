import { KyselyDB } from "../../../database/types/kysely.types";
import { BaseRepo } from "../repos/base.repo";
import { BasePropertyRepo } from "../repos/base-property.repo";
import { BaseViewRepo } from "../repos/base-view.repo";
import { PageService } from '../../../core/page/services/page.service';
import { PageRepo } from "../../../database/repos/page/page.repo";
import { Page } from "../../../database/types/entity.types";
import { CreateBaseDto } from '../dto/create-base.dto';
import { UpdateBaseDto } from '../dto/update-base.dto';
import { PaginationOptions } from "../../../database/pagination/pagination-options";
export declare class BaseService {
    private readonly db;
    private readonly baseRepo;
    private readonly basePropertyRepo;
    private readonly baseViewRepo;
    private readonly pageService;
    private readonly pageRepo;
    constructor(db: KyselyDB, baseRepo: BaseRepo, basePropertyRepo: BasePropertyRepo, baseViewRepo: BaseViewRepo, pageService: PageService, pageRepo: PageRepo);
    create(userId: string, workspaceId: string, dto: CreateBaseDto, defaults?: {
        template?: string;
    }): Promise<import("@docmost/ee/base/repos/base.repo").BasePage>;
    convertPageToBase(page: Page, userId: string, template?: string): Promise<import("@docmost/ee/base/repos/base.repo").BasePage>;
    private seedKanbanTemplate;
    getBaseInfo(pageId: string): Promise<import("@docmost/ee/base/repos/base.repo").BasePage>;
    update(dto: UpdateBaseDto): Promise<import("@docmost/ee/base/repos/base.repo").BasePage>;
    delete(pageId: string): Promise<void>;
    listBySpaceId(spaceId: string, pagination: PaginationOptions): Promise<import("../../../database/pagination/cursor-pagination").CursorPaginationResult<{
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
}
