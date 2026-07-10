import { RedisService } from '@nestjs-labs/nestjs-ioredis';
export type PresenceEntry = {
    userId: string;
    cellId?: string | null;
    selection?: unknown;
    ts: number;
};
export declare class BasePresenceService {
    private readonly redisService;
    private readonly logger;
    private readonly redis;
    constructor(redisService: RedisService);
    setPresence(pageId: string, entry: PresenceEntry): Promise<void>;
    leave(pageId: string, userId: string): Promise<void>;
    snapshot(pageId: string): Promise<PresenceEntry[]>;
}
