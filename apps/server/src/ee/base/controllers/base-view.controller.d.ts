import { BaseViewService } from '../services/base-view.service';
import { BaseRepo } from "../repos/base.repo";
import { CreateViewDto } from '../dto/create-view.dto';
import { UpdateViewDto, DeleteViewDto } from '../dto/update-view.dto';
import { BaseIdDto } from '../dto/base.dto';
import { User, Workspace } from "../../../database/types/entity.types";
import { PageAccessService } from '../../../core/page/page-access/page-access.service';
export declare class BaseViewController {
    private readonly baseViewService;
    private readonly baseRepo;
    private readonly pageAccessService;
    constructor(baseViewService: BaseViewService, baseRepo: BaseRepo, pageAccessService: PageAccessService);
    create(dto: CreateViewDto, user: User, workspace: Workspace): Promise<{
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
    update(dto: UpdateViewDto, user: User, workspace: Workspace): Promise<{
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
    delete(dto: DeleteViewDto, user: User, workspace: Workspace): Promise<void>;
    list(dto: BaseIdDto, user: User, workspace: Workspace): Promise<{
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
