import { KyselyDB } from "../../database/types/kysely.types";
import { AttachmentRepo } from "../../database/repos/attachment/attachment.repo";
import { PagePermissionRepo } from "../../database/repos/page/page-permission.repo";
import { StorageService } from '../../integrations/storage/storage.service';
import { ExpressionBuilder } from 'kysely';
import { SearchDTO } from '../../core/search/dto/search.dto';
import { SearchResponseDto } from '../../core/search/dto/search-response.dto';
import { SpaceMemberRepo } from "../../database/repos/space/space-member.repo";
import { DB } from '@docmost/db/types/db';
import { Queue } from 'bullmq';
export declare class AttachmentEeService {
    private readonly attachmentRepo;
    private readonly pagePermissionRepo;
    private readonly storageService;
    private readonly db;
    private spaceMemberRepo;
    private attachmentQueue;
    private readonly logger;
    constructor(attachmentRepo: AttachmentRepo, pagePermissionRepo: PagePermissionRepo, storageService: StorageService, db: KyselyDB, spaceMemberRepo: SpaceMemberRepo, attachmentQueue: Queue);
    indexAttachment(attachmentId: string): Promise<void>;
    searchAttachment(query: string, searchParams: SearchDTO, opts: {
        userId?: string;
        workspaceId: string;
    }): Promise<{
        items: SearchResponseDto[];
    }>;
    indexAttachments(workspaceId?: string): Promise<void>;
    triggerAttachmentsIndexing(workspaceId?: string, delayMs?: number): Promise<void>;
    withPage(eb: ExpressionBuilder<DB, 'attachments'>): import("kysely").AliasedRawBuilder<{
        id: string;
        title: string;
        icon: string;
        slugId: string;
    }, "page">;
    withSpace(eb: ExpressionBuilder<DB, 'attachments'>): import("kysely").AliasedRawBuilder<{
        id: string;
        name: string;
        slug: string;
    }, "space">;
    convertPdfToMarkdown(fileBuffer: Buffer): Promise<string>;
    convertDocxToText(fileBuffer: Buffer): Promise<string>;
}
