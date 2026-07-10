import { OnModuleDestroy } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { KyselyDB } from "../../../database/types/kysely.types";
import { WorkspaceRepo } from "../../../database/repos/workspace/workspace.repo";
import { BillingService } from "../services/billing.service";
import { MailService } from '../../../integrations/mail/mail.service';
import { DomainService } from '../../../integrations/environment/domain.service';
export declare class BillingProcessor extends WorkerHost implements OnModuleDestroy {
    private readonly db;
    private readonly workspaceRepo;
    private readonly billingService;
    private mailService;
    private domainService;
    private readonly logger;
    constructor(db: KyselyDB, workspaceRepo: WorkspaceRepo, billingService: BillingService, mailService: MailService, domainService: DomainService);
    process(job: Job<any, void>): Promise<void>;
    onActive(job: Job): void;
    onError(job: Job): void;
    onCompleted(job: Job): void;
    onModuleDestroy(): Promise<void>;
}
