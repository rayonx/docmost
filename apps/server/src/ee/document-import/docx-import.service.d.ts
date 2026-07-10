import { KyselyDB } from "../../database/types/kysely.types";
import { StorageService } from '../../integrations/storage/storage.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { LicenseService } from "../licence/license.service";
export declare class DocxImportService {
    private readonly storageService;
    private readonly environmentService;
    private readonly licenseService;
    private readonly db;
    private readonly logger;
    constructor(storageService: StorageService, environmentService: EnvironmentService, licenseService: LicenseService, db: KyselyDB);
    convertDocxToHtml(fileBuffer: Buffer, workspaceId: string, spaceId: string, pageId: string, creatorId: string): Promise<string>;
}
