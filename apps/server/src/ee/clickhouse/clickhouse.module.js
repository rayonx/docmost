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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ClickHouseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseModule = void 0;
const common_1 = require("@nestjs/common");
const clickhouse_provider_1 = require("./clickhouse.provider");
const clickhouse_constants_1 = require("./clickhouse.constants");
const client_1 = require("@clickhouse/client");
const nestjs_ioredis_1 = require("@nestjs-labs/nestjs-ioredis");
const migrations_1 = require("./migrations");
const LOCK_KEY = 'clickhouse:migration:lock';
const LOCK_TTL_MS = 30_000;
const LOCK_RETRY_INTERVAL_MS = 500;
const LOCK_MAX_RETRIES = 20;
let ClickHouseModule = ClickHouseModule_1 = class ClickHouseModule {
    constructor(client, redisService) {
        this.client = client;
        this.redisService = redisService;
        this.logger = new common_1.Logger(ClickHouseModule_1.name);
        this.redis = this.redisService.getOrThrow();
    }
    async onApplicationBootstrap() {
        if (!this.client)
            return;
        try {
            await this.runMigrations();
        }
        catch (err) {
            this.logger.error({ err }, 'ClickHouse migration failed');
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.close();
        }
    }
    async runMigrations() {
        const lockValue = `${process.pid}-${Date.now()}`;
        const acquired = await this.acquireLock(lockValue);
        if (!acquired) {
            this.logger.warn('Could not acquire migration lock — another instance is running migrations');
            return;
        }
        try {
            await this.executeMigrations();
        }
        finally {
            await this.releaseLock(lockValue);
        }
    }
    async executeMigrations() {
        await this.client.command({
            query: `
        CREATE TABLE IF NOT EXISTS _migrations (
            name String,
            applied_at DateTime DEFAULT now()
        )
        ENGINE = ReplacingMergeTree(applied_at)
        ORDER BY name
      `,
        });
        const result = await this.client.query({
            query: 'SELECT name FROM _migrations ORDER BY name',
            format: 'JSONEachRow',
        });
        const applied = new Set((await result.json()).map((r) => r.name));
        for (const migration of migrations_1.migrations) {
            if (applied.has(migration.name))
                continue;
            this.logger.log(`Running ClickHouse migration: ${migration.name}`);
            try {
                await migration.up(this.client);
            }
            catch (err) {
                this.logger.error({ err }, `ClickHouse migration ${migration.name} failed`);
                throw err;
            }
            await this.client.insert({
                table: '_migrations',
                values: [{ name: migration.name }],
                format: 'JSONEachRow',
            });
            this.logger.log(`ClickHouse migration ${migration.name} applied`);
        }
    }
    async acquireLock(value) {
        for (let attempt = 0; attempt < LOCK_MAX_RETRIES; attempt++) {
            const acquired = await this.redis.set(LOCK_KEY, value, 'PX', LOCK_TTL_MS, 'NX');
            if (acquired === 'OK')
                return true;
            await new Promise((r) => setTimeout(r, LOCK_RETRY_INTERVAL_MS));
        }
        return false;
    }
    async releaseLock(value) {
        const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
        await this.redis.eval(script, 1, LOCK_KEY, value);
    }
};
exports.ClickHouseModule = ClickHouseModule;
exports.ClickHouseModule = ClickHouseModule = ClickHouseModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [clickhouse_provider_1.clickhouseClientProvider],
        exports: [clickhouse_constants_1.CLICKHOUSE_CLIENT],
    }),
    __param(0, (0, common_1.Inject)(clickhouse_constants_1.CLICKHOUSE_CLIENT)),
    __metadata("design:paramtypes", [client_1.ClickHouseClient,
        nestjs_ioredis_1.RedisService])
], ClickHouseModule);
//# sourceMappingURL=clickhouse.module.js.map