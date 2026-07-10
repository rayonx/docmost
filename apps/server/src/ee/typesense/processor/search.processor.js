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
var SearchProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchProcessor = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../../integrations/queue/constants");
const typesense_init_service_1 = require("../services/typesense-init.service");
const typesense_sync_service_1 = require("../services/typesense-sync.service");
const environment_service_1 = require("../../../integrations/environment/environment.service");
let SearchProcessor = SearchProcessor_1 = class SearchProcessor extends bullmq_1.WorkerHost {
    constructor(typesenseHealthService, typesenseSyncService, environmentService) {
        super();
        this.typesenseHealthService = typesenseHealthService;
        this.typesenseSyncService = typesenseSyncService;
        this.environmentService = environmentService;
        this.logger = new common_1.Logger(SearchProcessor_1.name);
    }
    async process(job) {
        if (this.environmentService.getSearchDriver() !== 'typesense') {
            return;
        }
        try {
            switch (job.name) {
                case constants_1.QueueJob.SEARCH_INDEX_PAGES:
                    await this.typesenseHealthService.checkAndSync();
                    break;
                case constants_1.QueueJob.TYPESENSE_FLUSH:
                    await this.typesenseSyncService.flushQueue();
                    break;
                case constants_1.QueueJob.PAGE_CREATED:
                case constants_1.QueueJob.PAGE_UPDATED:
                case constants_1.QueueJob.PAGE_RESTORED:
                    await this.typesenseSyncService.queuePageUpsertBatch(job.data.pageIds);
                    break;
                case constants_1.QueueJob.PAGE_DELETED:
                case constants_1.QueueJob.PAGE_SOFT_DELETED:
                    await this.typesenseSyncService.queuePageDeleteBatch(job.data.pageIds);
                    break;
                case constants_1.QueueJob.SPACE_DELETED:
                    await this.typesenseSyncService.deleteRecordsBySpaceId(job.data.spaceId);
                    break;
            }
        }
        catch (err) {
            throw err;
        }
    }
    onActive(job) {
        if (job.name !== constants_1.QueueJob.TYPESENSE_FLUSH) {
            this.logger.debug(`Processing ${job.name} job`);
        }
    }
    onError(job) {
        this.logger.error(`Error processing ${job.name} job. Reason: ${job.failedReason}`);
    }
    onCompleted(job) {
        if (job.name !== constants_1.QueueJob.TYPESENSE_FLUSH) {
            this.logger.debug(`Completed ${job.name} job`);
        }
    }
    async onModuleDestroy() {
        if (this.worker) {
            await this.worker.close();
        }
    }
};
exports.SearchProcessor = SearchProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], SearchProcessor.prototype, "onActive", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], SearchProcessor.prototype, "onError", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], SearchProcessor.prototype, "onCompleted", null);
exports.SearchProcessor = SearchProcessor = SearchProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(constants_1.QueueName.SEARCH_QUEUE),
    __metadata("design:paramtypes", [typesense_init_service_1.TypesenseInitService,
        typesense_sync_service_1.TypesenseSyncService,
        environment_service_1.EnvironmentService])
], SearchProcessor);
//# sourceMappingURL=search.processor.js.map