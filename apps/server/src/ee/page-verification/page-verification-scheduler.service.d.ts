import { OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PageVerificationRepo } from './page-verification.repo';
export declare class PageVerificationSchedulerService implements OnApplicationBootstrap {
    private readonly notificationQueue;
    private readonly verificationRepo;
    private readonly logger;
    constructor(notificationQueue: Queue, verificationRepo: PageVerificationRepo);
    onApplicationBootstrap(): Promise<void>;
    reschedule(verificationId: string, expiresAt: Date | null): Promise<void>;
    reconcile(): Promise<void>;
    private cancel;
    private expiringJobId;
    private expiredJobId;
}
