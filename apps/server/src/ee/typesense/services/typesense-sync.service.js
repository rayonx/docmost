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
var TypesenseSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesenseSyncService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const nestjs_kysely_1 = require("nestjs-kysely");
const constants_1 = require("../../../integrations/queue/constants");
const typesense_service_1 = require("./typesense.service");
const constants_2 = require("../constants");
const typesense_util_1 = require("../typesense.util");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const nestjs_ioredis_1 = require("@nestjs-labs/nestjs-ioredis");
const TYPESENSE_REDIS_KEYS = {
    PAGE_UPSERT: 'typesense:sync:pages:upsert',
    PAGE_DELETE: 'typesense:sync:pages:delete',
};
let TypesenseSyncService = TypesenseSyncService_1 = class TypesenseSyncService {
    constructor(searchQueue, db, typesenseService, environmentService, redisService) {
        this.searchQueue = searchQueue;
        this.db = db;
        this.typesenseService = typesenseService;
        this.environmentService = environmentService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(TypesenseSyncService_1.name);
        this.consecutiveHealthFailures = 0;
        this.nextHealthCheckTime = 0;
        this.redis = this.redisService.getOrThrow();
    }
    async onApplicationBootstrap() {
        if (this.environmentService.getSearchDriver() !== 'typesense') {
            await this.removeJobScheduler();
            return;
        }
        await this.setupJobScheduler();
    }
    async setupJobScheduler() {
        await this.searchQueue.upsertJobScheduler(constants_2.TYPESENSE_SCHEDULER_ID, { every: 60 * 1000 }, {
            name: constants_1.QueueJob.TYPESENSE_FLUSH,
            data: {},
        });
        this.logger.debug('Typesense flush job scheduler created');
    }
    async removeJobScheduler() {
        try {
            const jobScheduler = await this.searchQueue.getJobScheduler(constants_2.TYPESENSE_SCHEDULER_ID);
            if (jobScheduler?.id) {
                await this.searchQueue.removeJobScheduler(constants_2.TYPESENSE_SCHEDULER_ID);
                this.logger.debug('Typesense flush job scheduler removed');
            }
        }
        catch (error) {
        }
    }
    async deleteRecordsBySpaceId(spaceId) {
        try {
            await this.typesenseService
                .getClient()
                .collections(constants_2.CollectionSchema.PAGE)
                .documents()
                .delete({ filter_by: `spaceId:=${spaceId}` });
            this.logger.debug(`Deleted all pages for space ${spaceId} from Typesense`);
        }
        catch (error) {
            this.logger.error({ err: (0, typesense_util_1.extractTypesenseError)(error) }, `Failed to delete pages for space ${spaceId} from Typesense`);
            throw new Error((0, typesense_util_1.extractTypesenseError)(error));
        }
    }
    async queuePageUpsertBatch(pageIds) {
        if (pageIds.length === 0)
            return;
        await this.redis.sadd(TYPESENSE_REDIS_KEYS.PAGE_UPSERT, ...pageIds);
    }
    async queuePageDeleteBatch(pageIds) {
        if (pageIds.length === 0)
            return;
        await this.redis.srem(TYPESENSE_REDIS_KEYS.PAGE_UPSERT, ...pageIds);
        await this.redis.sadd(TYPESENSE_REDIS_KEYS.PAGE_DELETE, ...pageIds);
    }
    async flushQueue() {
        try {
            const now = Date.now();
            if (now < this.nextHealthCheckTime) {
                return;
            }
            if (!(await this.isTypesenseHealthy())) {
                this.consecutiveHealthFailures++;
                const backoffMs = Math.min(60_000 * Math.pow(2, this.consecutiveHealthFailures - 1), 480_000);
                this.nextHealthCheckTime = now + backoffMs;
                this.logger.warn(`Typesense is unreachable (failure #${this.consecutiveHealthFailures}), next retry in ${Math.round(backoffMs / 1000)}s`);
                return;
            }
            this.consecutiveHealthFailures = 0;
            this.nextHealthCheckTime = 0;
            await this.flushPageQueue();
        }
        catch (error) {
            this.logger.error({ err: error }, 'Error flushing typesense queue');
        }
    }
    async isTypesenseHealthy() {
        try {
            await this.typesenseService.getClient().health.retrieve();
            return true;
        }
        catch {
            return false;
        }
    }
    async flushPageQueue() {
        const batchSize = 1000;
        try {
            await this.processUpsertBatch(TYPESENSE_REDIS_KEYS.PAGE_UPSERT, batchSize, 'pages', async (batchIds) => {
                const pages = await this.db
                    .selectFrom('pages')
                    .select([
                    'id',
                    'slugId',
                    'title',
                    'icon',
                    'textContent',
                    'parentPageId',
                    'creatorId',
                    'spaceId',
                    'workspaceId',
                    'createdAt',
                    'updatedAt',
                    'contributorIds',
                ])
                    .where('id', 'in', batchIds)
                    .where('deletedAt', 'is', null)
                    .execute();
                const documents = pages.map(typesense_util_1.transformPageToDocument);
                await this.typesenseService
                    .getClient()
                    .collections(constants_2.CollectionSchema.PAGE)
                    .documents()
                    .import(documents, { action: 'upsert' });
                return documents.length;
            });
            await this.processDeleteBatch(TYPESENSE_REDIS_KEYS.PAGE_DELETE, batchSize, 'pages', async (batchIds) => {
                await this.typesenseService
                    .getClient()
                    .collections(constants_2.CollectionSchema.PAGE)
                    .documents()
                    .delete({ filter_by: `id:=[${batchIds.join(',')}]` });
                return batchIds.length;
            });
        }
        catch (error) {
            this.logger.error({ err: (0, typesense_util_1.extractTypesenseError)(error) }, `Typesense sync for collection failed`);
        }
    }
    async processUpsertBatch(queueKey, batchSize, entityName, processor) {
        const totalCount = await this.redis.scard(queueKey);
        if (totalCount === 0)
            return;
        this.logger.debug(`Processing ${totalCount} ${entityName} upserts`);
        let processedCount = 0;
        while (true) {
            const batchIds = await this.redis.spop(queueKey, batchSize);
            if (!batchIds || batchIds.length === 0)
                break;
            try {
                const count = await processor(batchIds);
                processedCount += count;
                this.logger.debug(`Indexed ${processedCount}/${totalCount} ${entityName}`);
            }
            catch (error) {
                this.logger.error({ err: (0, typesense_util_1.extractTypesenseError)(error) }, `Failed to flush batch of ${batchIds.length} ${entityName} upserts`);
                await this.redis.sadd(queueKey, ...batchIds);
                break;
            }
        }
        if (processedCount > 0) {
            this.logger.debug(`Successfully indexed ${processedCount} ${entityName}`);
        }
    }
    async processDeleteBatch(queueKey, batchSize, entityName, processor) {
        const totalCount = await this.redis.scard(queueKey);
        if (totalCount === 0)
            return;
        this.logger.debug(`Processing ${totalCount} ${entityName} deletes`);
        let processedCount = 0;
        while (true) {
            const batchIds = await this.redis.spop(queueKey, batchSize);
            if (!batchIds || batchIds.length === 0)
                break;
            try {
                const count = await processor(batchIds);
                processedCount += count;
                this.logger.debug(`Deleted ${processedCount}/${totalCount} ${entityName}`);
            }
            catch (error) {
                this.logger.error({ err: (0, typesense_util_1.extractTypesenseError)(error) }, `Failed to flush batch of ${batchIds.length} ${entityName} deletes`);
                await this.redis.sadd(queueKey, ...batchIds);
                break;
            }
        }
        if (processedCount > 0) {
            this.logger.debug(`Successfully deleted ${processedCount} ${entityName}`);
        }
    }
    async getQueueStats() {
        return {
            pages: {
                upsert: await this.redis.scard(TYPESENSE_REDIS_KEYS.PAGE_UPSERT),
                delete: await this.redis.scard(TYPESENSE_REDIS_KEYS.PAGE_DELETE),
            },
        };
    }
};
exports.TypesenseSyncService = TypesenseSyncService;
exports.TypesenseSyncService = TypesenseSyncService = TypesenseSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(constants_1.QueueName.SEARCH_QUEUE)),
    __param(1, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [bullmq_2.Queue, Object, typesense_service_1.TypesenseService,
        environment_service_1.EnvironmentService,
        nestjs_ioredis_1.RedisService])
], TypesenseSyncService);
//# sourceMappingURL=typesense-sync.service.js.map