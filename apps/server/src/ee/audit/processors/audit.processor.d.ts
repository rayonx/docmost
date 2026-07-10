import { OnModuleDestroy } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuditLogData } from '../../../common/events/audit-events';
import { IAuditStore } from '../stores/audit-store.types';
export declare class AuditProcessor extends WorkerHost implements OnModuleDestroy {
    private readonly auditStore;
    private readonly logger;
    constructor(auditStore: IAuditStore);
    process(job: Job<AuditLogData, void>): Promise<void>;
    onActive(job: Job): void;
    onError(job: Job): void;
    onCompleted(job: Job): void;
    onModuleDestroy(): Promise<void>;
}
