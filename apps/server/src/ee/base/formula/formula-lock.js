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
var FormulaLockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulaLockService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_ioredis_1 = require("@nestjs-labs/nestjs-ioredis");
const LOCK_PREFIX = "base-formula-recompute-lock:";
const LOCK_TTL_MS = 15 * 60 * 1000;
let FormulaLockService = FormulaLockService_1 = class FormulaLockService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(FormulaLockService_1.name);
        this.redis = this.redisService.getOrThrow();
    }
    async acquire(pageId) {
        const token = `${Date.now()}-${Math.random()}`;
        const ok = await this.redis.set(LOCK_PREFIX + pageId, token, "PX", LOCK_TTL_MS, "NX");
        return ok === "OK" ? token : null;
    }
    async release(pageId, token) {
        const lua = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
        await this.redis.eval(lua, 1, LOCK_PREFIX + pageId, token);
    }
    async acquireWait(pageId, opts) {
        const deadline = Date.now() + opts.timeoutMs;
        const poll = opts.pollMs ?? 500;
        while (Date.now() < deadline) {
            const t = await this.acquire(pageId);
            if (t)
                return t;
            await new Promise((r) => setTimeout(r, poll));
        }
        return null;
    }
};
exports.FormulaLockService = FormulaLockService;
exports.FormulaLockService = FormulaLockService = FormulaLockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_ioredis_1.RedisService])
], FormulaLockService);
//# sourceMappingURL=formula-lock.js.map