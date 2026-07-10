import { KyselyDB } from "../../../database/types/kysely.types";
import { Queue } from 'bullmq';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
export declare class AuditCleanupService {
    private readonly db;
    private readonly auditQueue;
    private readonly environmentService;
    private readonly logger;
    constructor(db: KyselyDB, auditQueue: Queue, environmentService: EnvironmentService);
    scheduleCleanup(): Promise<void>;
}
