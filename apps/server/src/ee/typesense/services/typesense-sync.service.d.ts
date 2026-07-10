import { OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';
import { KyselyDB } from "../../../database/types/kysely.types";
import { TypesenseService } from './typesense.service';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { RedisService } from '@nestjs-labs/nestjs-ioredis';
export declare class TypesenseSyncService implements OnApplicationBootstrap {
    private readonly searchQueue;
    private readonly db;
    private readonly typesenseService;
    private readonly environmentService;
    private readonly redisService;
    private readonly logger;
    private redis;
    private consecutiveHealthFailures;
    private nextHealthCheckTime;
    constructor(searchQueue: Queue, db: KyselyDB, typesenseService: TypesenseService, environmentService: EnvironmentService, redisService: RedisService);
    onApplicationBootstrap(): Promise<void>;
    setupJobScheduler(): Promise<void>;
    removeJobScheduler(): Promise<void>;
    deleteRecordsBySpaceId(spaceId: string): Promise<void>;
    queuePageUpsertBatch(pageIds: string[]): Promise<void>;
    queuePageDeleteBatch(pageIds: string[]): Promise<void>;
    flushQueue(): Promise<void>;
    private isTypesenseHealthy;
    private flushPageQueue;
    private processUpsertBatch;
    private processDeleteBatch;
    getQueueStats(): Promise<{
        pages: {
            upsert: number;
            delete: number;
        };
    }>;
}
