"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BasePresenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePresenceService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_ioredis_1 = require("@nestjs-labs/nestjs-ioredis");
const PRESENCE_KEY_PREFIX = 'presence:base:';
const PRESENCE_ENTRY_TTL_MS = 10_000;
const PRESENCE_KEY_TTL_S = 60;
let BasePresenceService = BasePresenceService_1 = class BasePresenceService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(BasePresenceService_1.name);
        this.redis = this.redisService.getOrThrow();
    }
    async setPresence(pageId, entry) {
        const key = PRESENCE_KEY_PREFIX + pageId;
        await this.redis
            .multi()
            .hset(key, entry.userId, JSON.stringify(entry))
            .expire(key, PRESENCE_KEY_TTL_S)
            .exec();
    }
    async leave(pageId, userId) {
        const key = PRESENCE_KEY_PREFIX + pageId;
        await this.redis.hdel(key, userId);
    }
    async snapshot(pageId) {
        const key = PRESENCE_KEY_PREFIX + pageId;
        const raw = await this.redis.hgetall(key);
        const now = Date.now();
        const out = [];
        const stale = [];
        for (const [field, value] of Object.entries(raw)) {
            try {
                const entry = JSON.parse(value);
                if (now - entry.ts <= PRESENCE_ENTRY_TTL_MS) {
                    out.push(entry);
                }
                else {
                    stale.push(field);
                }
            }
            catch {
                stale.push(field);
            }
        }
        if (stale.length > 0) {
            this.redis.hdel(key, ...stale).catch(() => { });
        }
        return out;
    }
};
exports.BasePresenceService = BasePresenceService;
exports.BasePresenceService = BasePresenceService = BasePresenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_ioredis_1.RedisService])
], BasePresenceService);
//# sourceMappingURL=base-presence.service.js.map