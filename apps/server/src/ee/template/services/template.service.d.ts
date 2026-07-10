import { TemplateRepo } from "../../../database/repos/template/template.repo";
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { UseTemplateDto } from '../dto/use-template.dto';
import { Template } from "../../../database/types/entity.types";
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { PageRepo } from "../../../database/repos/page/page.repo";
import { SpaceMemberRepo } from "../../../database/repos/space/space-member.repo";
import { PageService } from '../../../core/page/services/page.service';
export declare class TemplateService {
    private templateRepo;
    private pageRepo;
    private pageService;
    private spaceMemberRepo;
    constructor(templateRepo: TemplateRepo, pageRepo: PageRepo, pageService: PageService, spaceMemberRepo: SpaceMemberRepo);
    getTemplates(userId: string, workspaceId: string, pagination: PaginationOptions, spaceId?: string): Promise<import("../../../database/pagination/cursor-pagination").CursorPaginationResult<{
        description: string;
        id: string;
        workspaceId: string;
        creatorId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        content: import("../../../database/types/db").JsonValue;
        tsv: string;
        spaceId: string;
        icon: string;
        lastUpdatedById: string;
        textContent: string;
        ydoc: Buffer<ArrayBufferLike>;
        collaboratorIds: string[];
    } & {
        creator: {
            id: string;
            name: string;
            avatarUrl: string;
        };
    }, undefined>>;
    getTemplateById(templateId: string, workspaceId: string): Promise<Template>;
    createTemplate(userId: string, workspaceId: string, dto: CreateTemplateDto): Promise<Template>;
    updateTemplate(userId: string, workspaceId: string, dto: UpdateTemplateDto): Promise<Template>;
    deleteTemplate(templateId: string, workspaceId: string): Promise<void>;
    useTemplate(userId: string, workspaceId: string, dto: UseTemplateDto): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        content: import("../../../database/types/db").JsonValue;
        tsv: string;
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
        textContent: string;
        ydoc: Buffer<ArrayBufferLike>;
    }>;
}
