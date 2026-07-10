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
var AuditProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditProcessor = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../../integrations/queue/constants");
const audit_store_types_1 = require("../stores/audit-store.types");
let AuditProcessor = AuditProcessor_1 = class AuditProcessor extends bullmq_1.WorkerHost {
    constructor(auditStore) {
        super();
        this.auditStore = auditStore;
        this.logger = new common_1.Logger(AuditProcessor_1.name);
    }
    async process(job) {
        try {
            switch (job.name) {
                case constants_1.QueueJob.AUDIT_LOG:
                    await this.auditStore.insert(job.data);
                    break;
                case constants_1.QueueJob.AUDIT_CLEANUP: {
                    const { retentionDays = 365, workspaceId } = job.data;
                    const deletedCount = await this.auditStore.deleteOlderThan(retentionDays, workspaceId);
                    this.logger.log(`Audit cleanup completed for workspace ${workspaceId}: ${deletedCount} logs deleted`);
                    break;
                }
            }
        }
        catch (err) {
            this.logger.error({ err }, `Failed to process ${job.name} job`);
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
exports.AuditProcessor = AuditProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], AuditProcessor.prototype, "onActive", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], AuditProcessor.prototype, "onError", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], AuditProcessor.prototype, "onCompleted", null);
exports.AuditProcessor = AuditProcessor = AuditProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(constants_1.QueueName.AUDIT_QUEUE),
    __param(0, (0, common_1.Inject)(audit_store_types_1.AUDIT_STORE)),
    __metadata("design:paramtypes", [Object])
], AuditProcessor);
//# sourceMappingURL=audit.processor.js.map