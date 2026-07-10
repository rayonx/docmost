import { OnModuleDestroy } from '@nestjs/common';
import { OnApplicationBootstrap } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { RedisService } from '@nestjs-labs/nestjs-ioredis';
export declare class ClickHouseModule implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly client;
    private readonly redisService;
    private readonly logger;
    private readonly redis;
    constructor(client: ClickHouseClient | null, redisService: RedisService);
    onApplicationBootstrap(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private runMigrations;
    private executeMigrations;
    private acquireLock;
    private releaseLock;
}
