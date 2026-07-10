import { RedisService } from "@nestjs-labs/nestjs-ioredis";
export declare class FormulaLockService {
    private readonly redisService;
    private readonly logger;
    private readonly redis;
    constructor(redisService: RedisService);
    acquire(pageId: string): Promise<string | null>;
    release(pageId: string, token: string): Promise<void>;
    acquireWait(pageId: string, opts: {
        timeoutMs: number;
        pollMs?: number;
    }): Promise<string | null>;
}
