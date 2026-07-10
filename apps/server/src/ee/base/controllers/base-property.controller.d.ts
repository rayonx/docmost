import { BasePropertyService } from '../services/base-property.service';
import { BaseRepo } from "../repos/base.repo";
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto, DeletePropertyDto, ReorderPropertyDto } from '../dto/update-property.dto';
import { User, Workspace } from "../../../database/types/entity.types";
import { PageAccessService } from '../../../core/page/page-access/page-access.service';
export declare class BasePropertyController {
    private readonly basePropertyService;
    private readonly baseRepo;
    private readonly pageAccessService;
    constructor(basePropertyService: BasePropertyService, baseRepo: BaseRepo, pageAccessService: PageAccessService);
    create(dto: CreatePropertyDto, user: User, workspace: Workspace): Promise<any>;
    update(dto: UpdatePropertyDto, user: User, workspace: Workspace): Promise<{
        property: {
            type: string;
            id: string;
            workspaceId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            name: string;
            position: string;
            pageId: string;
            isPrimary: boolean;
            pendingType: string;
            pendingTypeOptions: import("../../../database/types/db").JsonValue;
            pendingToken: string;
            schemaVersion: number;
            typeOptions: import("../../../database/types/db").JsonValue;
        };
        jobId: string;
    }>;
    delete(dto: DeletePropertyDto, user: User, workspace: Workspace): Promise<void>;
    reorder(dto: ReorderPropertyDto, user: User, workspace: Workspace): Promise<void>;
}
