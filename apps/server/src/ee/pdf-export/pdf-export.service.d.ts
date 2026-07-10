import { Page } from "../../database/types/entity.types";
import { TokenService } from '../../core/auth/services/token.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { DomainService } from '../../integrations/environment/domain.service';
import { GotenbergClient } from './gotenberg.client';
import { KyselyDB } from "../../database/types/kysely.types";
import { Queue } from 'bullmq';
import { StorageService } from '../../integrations/storage/storage.service';
export declare class PdfExportService {
    private readonly tokenService;
    private readonly environmentService;
    private readonly domainService;
    private readonly gotenbergClient;
    private readonly storageService;
    private readonly db;
    private readonly fileTaskQueue;
    private readonly logger;
    constructor(tokenService: TokenService, environmentService: EnvironmentService, domainService: DomainService, gotenbergClient: GotenbergClient, storageService: StorageService, db: KyselyDB, fileTaskQueue: Queue);
    requestExport(page: Page, userId: string): Promise<{
        fileTaskId: string;
    }>;
    generateAndStorePdf(fileTaskId: string): Promise<void>;
    exportPageToPdf(page: Page): Promise<Buffer>;
    generateExportUrl(fileTaskId: string, workspaceId: string): Promise<string>;
    private findCachedExport;
    cleanupExpiredExports(): Promise<void>;
    scheduleCleanup(): Promise<void>;
}
