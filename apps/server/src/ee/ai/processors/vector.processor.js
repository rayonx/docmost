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
var VectorProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorProcessor = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const ai_search_service_1 = require("../services/ai-search.service");
const constants_1 = require("../../../integrations/queue/constants");
const vector_sync_service_1 = require("../services/vector-sync.service");
const page_embeddings_repo_1 = require("../repos/page-embeddings.repo");
const environment_service_1 = require("../../../integrations/environment/environment.service");
let VectorProcessor = VectorProcessor_1 = class VectorProcessor extends bullmq_1.WorkerHost {
    constructor(aiSearchService, vectorSyncService, pageEmbeddingsRepo, environmentService) {
        super();
        this.aiSearchService = aiSearchService;
        this.vectorSyncService = vectorSyncService;
        this.pageEmbeddingsRepo = pageEmbeddingsRepo;
        this.environmentService = environmentService;
        this.logger = new common_1.Logger(VectorProcessor_1.name);
    }
    async process(job) {
        if (!this.environmentService.getAiEmbeddingModel()?.length) {
            return;
        }
        const embedTableExists = await this.pageEmbeddingsRepo.isPageEmbeddingsTableExists();
        if (!embedTableExists) {
            return;
        }
        try {
            switch (job.name) {
                case constants_1.QueueJob.GENERATE_PAGE_EMBEDDINGS:
                    await this.aiSearchService.generatePageEmbeddings(job.data.pageId);
                    break;
                case constants_1.QueueJob.PAGE_CREATED:
                case constants_1.QueueJob.PAGE_RESTORED:
                case constants_1.QueueJob.PAGE_CONTENT_UPDATED:
                    await this.vectorSyncService.handlePageEmbeds(job.data.pageIds, job.data.workspaceId);
                    break;
                case constants_1.QueueJob.PAGE_MOVED_TO_SPACE:
                    await this.vectorSyncService.handlePageMovedToSpace(job.data.pageIds);
                    break;
                case constants_1.QueueJob.PAGE_DELETED:
                case constants_1.QueueJob.PAGE_SOFT_DELETED:
                    await this.vectorSyncService.handlePageDeletion(job.data.pageIds);
                    break;
                case constants_1.QueueJob.SPACE_DELETED:
                    await this.vectorSyncService.handleSpaceDeletion(job.data.spaceId);
                    break;
                case constants_1.QueueJob.WORKSPACE_CREATE_EMBEDDINGS:
                    await this.vectorSyncService.handleCreateEmbeddingsForWorkspace(job.data);
                    break;
                case constants_1.QueueJob.WORKSPACE_DELETE_EMBEDDINGS:
                    await this.vectorSyncService.handleDeleteEmbeddingsForWorkspace(job.data.workspaceId);
                    break;
            }
        }
        catch (err) {
            this.logger.error({ err }, `Failed to process job ${job.name}`);
            throw err;
        }
    }
    onActive(job) {
        this.logger.debug(`Processing ${job.name} job`);
    }
    onError(job) {
        this.logger.error(`Error processing ${job.name} job. Reason: ${job.failedReason}`);
    }
    onCompleted(job) {
        this.logger.debug(`Completed ${job.name} job`);
    }
    async onModuleDestroy() {
        if (this.worker) {
            await this.worker.close();
        }
    }
};
exports.VectorProcessor = VectorProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], VectorProcessor.prototype, "onActive", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], VectorProcessor.prototype, "onError", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], VectorProcessor.prototype, "onCompleted", null);
exports.VectorProcessor = VectorProcessor = VectorProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(constants_1.QueueName.AI_QUEUE),
    __metadata("design:paramtypes", [ai_search_service_1.AiSearchService,
        vector_sync_service_1.VectorSyncService,
        page_embeddings_repo_1.PageEmbeddingsRepo,
        environment_service_1.EnvironmentService])
], VectorProcessor);
//# sourceMappingURL=vector.processor.js.map