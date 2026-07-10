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
var VectorSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorSyncService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const kysely_1 = require("kysely");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../../integrations/queue/constants");
const ai_service_1 = require("./ai.service");
let VectorSyncService = VectorSyncService_1 = class VectorSyncService {
    constructor(db, environmentService, aiQueue, aiService) {
        this.db = db;
        this.environmentService = environmentService;
        this.aiQueue = aiQueue;
        this.aiService = aiService;
        this.logger = new common_1.Logger(VectorSyncService_1.name);
    }
    async handlePageEmbeds(pageIds, workspaceId) {
        if (!this.aiService.isDriverConfigured())
            return;
        if (pageIds.length === 0 || !workspaceId)
            return;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['settings'])
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        const aiSearchEnabled = workspace?.settings?.['ai']?.['search'] === true;
        if (!aiSearchEnabled)
            return;
        const delay = this.environmentService.isDevelopment()
            ? 30 * 1000
            : 10 * 60 * 1000;
        const jobs = pageIds.map((pageId) => ({
            name: constants_1.QueueJob.GENERATE_PAGE_EMBEDDINGS,
            data: { pageId },
            opts: {
                jobId: pageId,
                delay,
                removeOnComplete: true,
                removeOnFail: true,
                attempts: 2,
                backoff: {
                    type: 'fixed',
                    delay: 2 * 60 * 1000,
                },
            },
        }));
        await this.aiQueue.addBulk(jobs);
    }
    async handlePageMovedToSpace(pageIds) {
        if (pageIds.length === 0)
            return;
        const result = await this.db
            .updateTable('pageEmbeddings as pe')
            .set((eb) => ({
            spaceId: eb
                .selectFrom('pages as p')
                .select('p.spaceId')
                .whereRef('p.id', '=', 'pe.pageId')
                .limit(1),
        }))
            .where('pageId', 'in', pageIds)
            .executeTakeFirst();
        this.logger.debug(`Updated spaceId for ${result.numUpdatedRows} page embeddings after move`);
    }
    async handlePageDeletion(pageIds) {
        if (pageIds.length === 0)
            return;
        await this.db
            .deleteFrom('pageEmbeddings')
            .where('pageId', 'in', pageIds)
            .execute();
    }
    async handleSpaceDeletion(spaceId) {
        if (!spaceId)
            return;
        await this.db
            .deleteFrom('pageEmbeddings')
            .where('spaceId', '=', spaceId)
            .execute();
    }
    async handleCreateEmbeddingsForWorkspace(data) {
        if (!this.aiService.isDriverConfigured())
            return;
        const { workspaceId, global } = data;
        if (global && !workspaceId) {
            await this.queuePagesForEmbedding();
            return;
        }
        if (!workspaceId)
            return;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['settings'])
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        const aiSearchEnabled = workspace?.settings?.['ai']?.['search'] === true;
        if (!aiSearchEnabled)
            return;
        const deleteJobId = `ai-search-disabled-${workspaceId}`;
        const job = await this.aiQueue.getJob(deleteJobId);
        if (job) {
            await job.remove();
            this.logger.debug(`Cancelled pending AI search delete job for workspace ${workspaceId}`);
        }
        await this.queuePagesForEmbedding(workspaceId);
    }
    async handleDeleteEmbeddingsForWorkspace(workspaceId) {
        if (!workspaceId)
            return;
        await this.db
            .deleteFrom('pageEmbeddings')
            .where('workspaceId', '=', workspaceId)
            .execute();
    }
    async queuePagesForEmbedding(workspaceId) {
        let lastId = null;
        const BATCH_SIZE = 2000;
        let processed = 0;
        this.logger.debug(workspaceId
            ? `Starting to queue pages for embedding for workspace ${workspaceId}`
            : 'Starting to queue pages for embedding across all workspaces with AI search enabled');
        while (true) {
            let query = this.db
                .selectFrom('pages')
                .select('id')
                .where('deletedAt', 'is', null);
            if (workspaceId) {
                query = query.where('workspaceId', '=', workspaceId);
            }
            else {
                query = query.where(({ eb }) => eb.exists(eb
                    .selectFrom('workspaces')
                    .whereRef('workspaces.id', '=', 'pages.workspaceId')
                    .where((0, kysely_1.sql) `${kysely_1.sql.ref('settings')}->'ai'->>'search'`, '=', 'true')));
            }
            const pages = await query
                .$if(Boolean(lastId), (qb) => qb.where('id', '>', lastId))
                .orderBy('id', 'asc')
                .limit(BATCH_SIZE)
                .execute();
            if (pages.length === 0)
                break;
            const jobs = pages.map((page) => ({
                name: constants_1.QueueJob.GENERATE_PAGE_EMBEDDINGS,
                data: { pageId: page.id },
                opts: {
                    jobId: page.id,
                    removeOnComplete: true,
                    removeOnFail: true,
                    attempts: 2,
                    backoff: {
                        type: 'fixed',
                        delay: 2 * 60 * 1000,
                    },
                },
            }));
            await this.aiQueue.addBulk(jobs);
            lastId = pages[pages.length - 1].id;
            processed += pages.length;
        }
        this.logger.debug(workspaceId
            ? `Successfully queued ${processed} pages for embedding for workspace ${workspaceId}`
            : `Successfully queued ${processed} pages for embedding across all workspaces`);
    }
};
exports.VectorSyncService = VectorSyncService;
exports.VectorSyncService = VectorSyncService = VectorSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(2, (0, bullmq_1.InjectQueue)(constants_1.QueueName.AI_QUEUE)),
    __metadata("design:paramtypes", [Object, environment_service_1.EnvironmentService,
        bullmq_2.Queue,
        ai_service_1.AiService])
], VectorSyncService);
//# sourceMappingURL=vector-sync.service.js.map