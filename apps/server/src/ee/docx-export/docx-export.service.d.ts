import { KyselyDB } from "../../database/types/kysely.types";
import { Page } from "../../database/types/entity.types";
import { PagePermissionRepo } from "../../database/repos/page/page-permission.repo";
import { StorageService } from '../../integrations/storage/storage.service';
export declare class DocxExportService {
    private readonly pagePermissionRepo;
    private readonly db;
    private readonly storageService;
    constructor(pagePermissionRepo: PagePermissionRepo, db: KyselyDB, storageService: StorageService);
    exportPageToDocx(page: Page, userId: string): Promise<Buffer>;
    private resolveAccessibleAttachmentPaths;
}
