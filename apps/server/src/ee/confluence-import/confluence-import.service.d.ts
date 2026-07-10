import { KyselyDB } from "../../database/types/kysely.types";
import { ImportService } from '../../integrations/import/services/import.service';
import { FileTask } from "../../database/types/entity.types";
import { Cheerio, CheerioAPI } from 'cheerio';
import { BacklinkRepo } from "../../database/repos/backlink/backlink.repo";
import { ImportAttachmentService } from '../../integrations/import/services/import-attachment.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { LicenseService } from "../licence/license.service";
import { PageService } from '../../core/page/services/page.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAuditService } from '../../integrations/audit/audit.service';
export declare class ConfluenceImportService {
    private readonly importService;
    private readonly backlinkRepo;
    private readonly importAttachmentService;
    private readonly pageService;
    private readonly environmentService;
    private readonly licenseService;
    private readonly db;
    private eventEmitter;
    private readonly auditService;
    private readonly logger;
    constructor(importService: ImportService, backlinkRepo: BacklinkRepo, importAttachmentService: ImportAttachmentService, pageService: PageService, environmentService: EnvironmentService, licenseService: LicenseService, db: KyselyDB, eventEmitter: EventEmitter2, auditService: IAuditService);
    processConfluenceImport(opts: {
        extractDir: string;
        fileTask: FileTask;
    }): Promise<void>;
    confluenceFormatter($: CheerioAPI, $root: Cheerio<any>, currentFilePath?: string, anchorMap?: Map<string, string>, filePathToPageMetaMap?: Map<string, {
        id: string;
        title: string;
        slugId: string;
    }>, spaceSlug?: string): void;
    normalizeEmoji(raw: string): string;
    private extractAttachmentsMacroAndCleanHtml;
    private resolveWithinExtractDir;
    private parseConfluenceIndex;
    private formatImportHtml;
    private collectConfluenceAnchors;
    private processConfluenceAnchors;
}
