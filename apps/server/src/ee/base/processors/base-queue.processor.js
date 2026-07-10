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
var BaseQueueProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseQueueProcessor = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_2 = require("bullmq");
const nestjs_kysely_1 = require("nestjs-kysely");
const utils_1 = require("../../../database/utils");
const base_row_repo_1 = require("../repos/base-row.repo");
const base_property_repo_1 = require("../repos/base-property.repo");
const base_repo_1 = require("../repos/base.repo");
const constants_1 = require("../../../integrations/queue/constants");
const base_type_conversion_task_1 = require("../tasks/base-type-conversion.task");
const default_values_1 = require("../property-types/default-values");
const base_cell_gc_task_1 = require("../tasks/base-cell-gc.task");
const base_formula_recompute_task_1 = require("../tasks/base-formula-recompute.task");
const formula_lock_1 = require("../formula/formula-lock");
const event_contants_1 = require("../../../common/events/event.contants");
let BaseQueueProcessor = BaseQueueProcessor_1 = class BaseQueueProcessor extends bullmq_1.WorkerHost {
    constructor(db, baseRowRepo, basePropertyRepo, baseRepo, eventEmitter, formulaLock) {
        super();
        this.db = db;
        this.baseRowRepo = baseRowRepo;
        this.basePropertyRepo = basePropertyRepo;
        this.baseRepo = baseRepo;
        this.eventEmitter = eventEmitter;
        this.formulaLock = formulaLock;
        this.logger = new common_1.Logger(BaseQueueProcessor_1.name);
    }
    async process(job) {
        switch (job.name) {
            case constants_1.QueueJob.BASE_TYPE_CONVERSION: {
                const data = job.data;
                if (!(await (0, base_type_conversion_task_1.isConversionStillPending)(this.basePropertyRepo, data))) {
                    const property = await this.basePropertyRepo.findById(data.pageId, data.propertyId);
                    if (property &&
                        property.type === data.toType &&
                        !property.pendingType) {
                        const event = {
                            pageId: data.pageId,
                            workspaceId: data.workspaceId,
                            actorId: data.actorId ?? null,
                            requestId: null,
                            property,
                            schemaVersion: property.schemaVersion,
                        };
                        this.eventEmitter.emit(event_contants_1.EventName.BASE_PROPERTY_UPDATED, event);
                        const base = await this.baseRepo.findById(data.pageId);
                        if (base) {
                            this.emitSchemaBumped(data.pageId, data.workspaceId, base.baseSchemaVersion ?? 0, data.actorId);
                        }
                    }
                    this.logger.debug(`type-conversion job ${job.id} skipped: property ${data.propertyId} no longer pending for ${data.toType}`);
                    return { converted: 0, cleared: 0, total: 0, skipped: true };
                }
                const summary = await (0, base_type_conversion_task_1.processBaseTypeConversion)(this.db, this.baseRowRepo, data, {
                    progress: (processed) => job.updateProgress({ processed }),
                });
                const schemaVersion = await (0, utils_1.executeTx)(this.db, async (trx) => {
                    const stillPending = await (0, base_type_conversion_task_1.isConversionStillPending)(this.basePropertyRepo, data, trx);
                    if (!stillPending)
                        return null;
                    await this.basePropertyRepo.commitPendingTypeChange(data.pageId, data.propertyId, trx);
                    const backfillValue = (0, default_values_1.backfillDefaultForTypeChange)(data.fromType, data.toType, data.clearMode, data.toTypeOptions);
                    if (backfillValue != null) {
                        await this.baseRowRepo.seedEmptyCells(data.propertyId, backfillValue, {
                            pageId: data.pageId,
                            workspaceId: data.workspaceId,
                            trx,
                        });
                    }
                    await this.basePropertyRepo.bumpSchemaVersion(data.pageId, data.propertyId, trx);
                    return this.baseRepo.bumpSchemaVersion(data.pageId, trx);
                });
                if (schemaVersion === null) {
                    this.logger.warn(`type-conversion ${job.id}: pending cleared mid-run for property ${data.propertyId}; rewritten cells are inert under the retry guard`);
                    return { ...summary, skipped: true };
                }
                const updated = await this.basePropertyRepo.findById(data.pageId, data.propertyId);
                if (updated) {
                    const event = {
                        pageId: data.pageId,
                        workspaceId: data.workspaceId,
                        actorId: data.actorId ?? null,
                        requestId: null,
                        property: updated,
                        schemaVersion: updated.schemaVersion,
                    };
                    this.eventEmitter.emit(event_contants_1.EventName.BASE_PROPERTY_UPDATED, event);
                }
                this.emitSchemaBumped(data.pageId, data.workspaceId, schemaVersion, data.actorId);
                return summary;
            }
            case constants_1.QueueJob.BASE_CELL_GC: {
                const data = job.data;
                await (0, base_cell_gc_task_1.processBaseCellGc)(this.db, this.baseRowRepo, this.basePropertyRepo, data);
                const schemaVersion = await this.baseRepo.bumpSchemaVersion(data.pageId);
                this.emitSchemaBumped(data.pageId, data.workspaceId, schemaVersion);
                return;
            }
            case constants_1.QueueJob.BASE_FORMULA_RECOMPUTE: {
                const data = job.data;
                const token = await this.formulaLock.acquireWait(data.pageId, {
                    timeoutMs: 30_000,
                });
                if (!token) {
                    throw new Error(`formula recompute: lock acquire timeout for base ${data.pageId}`);
                }
                try {
                    this.eventEmitter.emit(event_contants_1.EventName.BASE_FORMULA_RECOMPUTE_STARTED, {
                        pageId: data.pageId,
                        workspaceId: data.workspaceId,
                        actorId: data.actorId ?? null,
                        requestId: null,
                        propertyIds: data.propertyIds,
                        jobId: String(job.id ?? ''),
                    });
                    const result = await (0, base_formula_recompute_task_1.processBaseFormulaRecompute)(this.db, this.baseRowRepo, this.basePropertyRepo, data, {
                        progress: (processed) => job.updateProgress({ processed }),
                        onBatch: async (batch) => {
                            this.eventEmitter.emit(event_contants_1.EventName.BASE_ROWS_UPDATED, {
                                pageId: data.pageId,
                                workspaceId: data.workspaceId,
                                actorId: null,
                                requestId: null,
                                rowIds: batch.map((b) => b.id),
                                propertyIds: data.propertyIds,
                            });
                        },
                    });
                    const schemaVersion = await this.baseRepo.bumpSchemaVersion(data.pageId);
                    this.eventEmitter.emit(event_contants_1.EventName.BASE_SCHEMA_BUMPED, {
                        pageId: data.pageId,
                        workspaceId: data.workspaceId,
                        actorId: data.actorId ?? null,
                        requestId: null,
                        schemaVersion,
                    });
                    this.eventEmitter.emit(event_contants_1.EventName.BASE_FORMULA_RECOMPUTE_COMPLETED, {
                        pageId: data.pageId,
                        workspaceId: data.workspaceId,
                        actorId: data.actorId ?? null,
                        requestId: null,
                        propertyIds: data.propertyIds,
                        jobId: String(job.id ?? ''),
                        processed: result.processed,
                        errored: result.errored,
                    });
                    return result;
                }
                finally {
                    await this.formulaLock.release(data.pageId, token);
                }
            }
            default:
                this.logger.warn(`Unknown job: ${job.name}`);
        }
    }
    emitSchemaBumped(pageId, workspaceId, schemaVersion, actorId) {
        const event = {
            pageId,
            workspaceId,
            actorId: actorId ?? null,
            requestId: null,
            schemaVersion,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_SCHEMA_BUMPED, event);
    }
    onActive(job) {
        this.logger.debug(`Processing ${job.name} job ${job.id}`);
    }
    async onError(job) {
        this.logger.error(`Error processing ${job.name} job ${job.id}. Reason: ${job.failedReason}`);
        if (job.name === constants_1.QueueJob.BASE_TYPE_CONVERSION) {
            const data = job.data;
            const attemptsMax = job.opts.attempts ?? 1;
            if (job.attemptsMade < attemptsMax) {
                this.logger.warn(`type-conversion job ${job.id} attempt ${job.attemptsMade}/${attemptsMax} failed; retry scheduled, keeping pending state`);
                return;
            }
            try {
                await this.basePropertyRepo.clearPendingTypeChange(data.pageId, data.propertyId, data.pendingToken);
                await this.baseRepo.bumpSchemaVersion(data.pageId);
                const reverted = await this.basePropertyRepo.findById(data.pageId, data.propertyId);
                if (reverted) {
                    const event = {
                        pageId: data.pageId,
                        workspaceId: data.workspaceId,
                        actorId: data.actorId ?? null,
                        requestId: null,
                        property: reverted,
                        schemaVersion: reverted.schemaVersion,
                    };
                    this.eventEmitter.emit(event_contants_1.EventName.BASE_PROPERTY_UPDATED, event);
                }
            }
            catch (cleanupErr) {
                this.logger.error(`Failed to clear pending type change on property ${data.propertyId}`, cleanupErr);
            }
        }
    }
    onCompleted(job) {
        this.logger.debug(`Completed ${job.name} job ${job.id}`);
    }
    async onModuleDestroy() {
        if (this.worker) {
            await this.worker.close();
        }
    }
};
exports.BaseQueueProcessor = BaseQueueProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], BaseQueueProcessor.prototype, "onActive", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", Promise)
], BaseQueueProcessor.prototype, "onError", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], BaseQueueProcessor.prototype, "onCompleted", null);
exports.BaseQueueProcessor = BaseQueueProcessor = BaseQueueProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(constants_1.QueueName.BASE_QUEUE),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, base_row_repo_1.BaseRowRepo,
        base_property_repo_1.BasePropertyRepo,
        base_repo_1.BaseRepo,
        event_emitter_1.EventEmitter2,
        formula_lock_1.FormulaLockService])
], BaseQueueProcessor);
//# sourceMappingURL=base-queue.processor.js.map