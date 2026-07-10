import { KyselyDB } from "../../../database/types/kysely.types";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseViewRepo } from "../repos/base-view.repo";
import { CreateViewDto } from '../dto/create-view.dto';
import { UpdateViewDto, DeleteViewDto } from '../dto/update-view.dto';
export declare class BaseViewService {
    private readonly db;
    private readonly baseViewRepo;
    private readonly eventEmitter;
    constructor(db: KyselyDB, baseViewRepo: BaseViewRepo, eventEmitter: EventEmitter2);
    create(userId: string, workspaceId: string, dto: CreateViewDto): Promise<{
        type: string;
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: string;
        pageId: string;
        config: string | number | boolean | import("../../../database/types/db").JsonArray | import("../../../database/types/db").JsonObject;
    }>;
    update(dto: UpdateViewDto, workspaceId: string, userId?: string): Promise<{
        type: string;
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: string;
        pageId: string;
        config: string | number | boolean | import("../../../database/types/db").JsonArray | import("../../../database/types/db").JsonObject;
    }>;
    delete(dto: DeleteViewDto, workspaceId: string, userId?: string): Promise<void>;
    listByBaseId(pageId: string, workspaceId: string): Promise<{
        type: string;
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: string;
        pageId: string;
        config: string | number | boolean | import("../../../database/types/db").JsonArray | import("../../../database/types/db").JsonObject;
    }[]>;
}
