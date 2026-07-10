import { Queue } from 'bullmq';
import { ClsService } from 'nestjs-cls';
import { Cache } from 'cache-manager';
import { AuditLogPayload, ActorType } from '../../../common/events/audit-events';
import { AuditLogContext } from '../../../integrations/audit/audit.service';
import { KyselyDB } from "../../../database/types/kysely.types";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { LicenseCheckService } from '../../../integrations/environment/license-check.service';
export declare class AuditService {
    private readonly auditQueue;
    private readonly cls;
    private readonly cacheManager;
    private readonly db;
    private readonly environmentService;
    private readonly licenseCheckService;
    private readonly logger;
    constructor(auditQueue: Queue, cls: ClsService, cacheManager: Cache, db: KyselyDB, environmentService: EnvironmentService, licenseCheckService: LicenseCheckService);
    log(payload: AuditLogPayload): Promise<void>;
    logWithContext(payload: AuditLogPayload, context: AuditLogContext): Promise<void>;
    logBatchWithContext(payloads: AuditLogPayload[], context: AuditLogContext): Promise<void>;
    private isLicensed;
    setActorId(actorId: string): void;
    setActorType(actorType: ActorType): void;
}
