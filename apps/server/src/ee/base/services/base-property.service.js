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
var BasePropertyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePropertyService = void 0;
exports.isUniqueViolation = isUniqueViolation;
exports.duplicateNameError = duplicateNameError;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const bullmq_1 = require("@nestjs/bullmq");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_2 = require("bullmq");
const kysely_1 = require("kysely");
const utils_1 = require("../../../database/utils");
const base_property_repo_1 = require("../repos/base-property.repo");
const base_row_repo_1 = require("../repos/base-row.repo");
const base_repo_1 = require("../repos/base.repo");
const base_view_repo_1 = require("../repos/base-view.repo");
const strip_property_from_view_config_1 = require("./strip-property-from-view-config");
const base_schemas_1 = require("../base.schemas");
const property_type_registry_1 = require("../property-types/property-type.registry");
const default_values_1 = require("../property-types/default-values");
const fractional_indexing_jittered_1 = require("fractional-indexing-jittered");
const constants_1 = require("../../../integrations/queue/constants");
const event_contants_1 = require("../../../common/events/event.contants");
const base_type_conversion_task_1 = require("../tasks/base-type-conversion.task");
const formula_service_1 = require("../formula/formula.service");
const server_1 = require("@docmost/base-formula/server");
const INLINE_CONVERSION_ROW_LIMIT = 2000;
let BasePropertyService = BasePropertyService_1 = class BasePropertyService {
    constructor(db, basePropertyRepo, baseRowRepo, baseRepo, baseViewRepo, baseQueue, eventEmitter, formulaService) {
        this.db = db;
        this.basePropertyRepo = basePropertyRepo;
        this.baseRowRepo = baseRowRepo;
        this.baseRepo = baseRepo;
        this.baseViewRepo = baseViewRepo;
        this.baseQueue = baseQueue;
        this.eventEmitter = eventEmitter;
        this.formulaService = formulaService;
        this.logger = new common_1.Logger(BasePropertyService_1.name);
    }
    async create(workspaceId, dto, actorId) {
        const type = dto.type;
        await this.ensureNameUnique(dto.pageId, dto.name);
        let validatedTypeOptions;
        if (type === 'formula') {
            const sourceCandidate = dto.typeOptions?.source;
            if (typeof sourceCandidate !== 'string') {
                throw new common_1.BadRequestException('formula.source is required');
            }
            const existing = await this.basePropertyRepo.findByPageId(dto.pageId);
            const compiled = this.formulaService.compile(sourceCandidate, existing);
            const candidate = {
                id: 'pending',
                type: 'formula',
                typeOptions: compiled,
            };
            const cycle = this.formulaService.detectCycle(candidate, existing);
            if (cycle)
                throw new common_1.BadRequestException({ code: 'CYCLE', path: cycle });
            validatedTypeOptions = compiled;
        }
        else {
            validatedTypeOptions = dto.typeOptions
                ? parseTypeOptionsOrThrow(type, dto.typeOptions)
                : parseTypeOptionsOrThrow(type, {});
        }
        const lastPosition = await this.basePropertyRepo.getLastPosition(dto.pageId);
        const position = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(lastPosition, null);
        const created = await (0, utils_1.executeTx)(this.db, async (trx) => {
            await this.ensureNameUnique(dto.pageId, dto.name, undefined, trx);
            let row;
            try {
                row = await this.basePropertyRepo.insertProperty({
                    pageId: dto.pageId,
                    name: dto.name,
                    type: dto.type,
                    position,
                    typeOptions: validatedTypeOptions,
                    workspaceId,
                }, trx);
            }
            catch (err) {
                if (isUniqueViolation(err))
                    throw duplicateNameError(dto.name);
                throw err;
            }
            await this.baseRepo.bumpSchemaVersion(dto.pageId, trx);
            return row;
        });
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: actorId ?? null,
            requestId: null,
            property: created,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_PROPERTY_CREATED, event);
        if (created.type === 'formula') {
            await this.formulaService.enqueueRecompute({
                pageId: created.pageId,
                workspaceId,
                propertyIds: [created.id],
                reason: 'formula_created',
                actorId: actorId ?? null,
            });
        }
        return created;
    }
    async update(dto, workspaceId, actorId) {
        const property = await this.basePropertyRepo.findById(dto.pageId, dto.propertyId);
        if (!property) {
            throw new common_1.NotFoundException('Property not found');
        }
        if (dto.name !== undefined) {
            await this.ensureNameUnique(dto.pageId, dto.name, dto.propertyId);
        }
        if (property.pendingType &&
            (dto.type !== undefined || dto.typeOptions !== undefined)) {
            throw new common_1.ConflictException('A type conversion is already in progress for this property');
        }
        const isTypeChange = dto.type && dto.type !== property.type;
        const oldType = property.type;
        const oldTypeOptions = property.typeOptions;
        const newType = (dto.type ?? property.type);
        if (isTypeChange && (0, property_type_registry_1.isSystemPropertyType)(oldType)) {
            throw new common_1.BadRequestException('Cannot change the type of a system property');
        }
        if (isTypeChange &&
            property.isPrimary &&
            newType !== base_schemas_1.BasePropertyType.TEXT) {
            throw new common_1.BadRequestException('The primary property must be text');
        }
        const isFormulaTarget = newType === 'formula';
        const sourceChanged = isFormulaTarget &&
            typeof dto.typeOptions?.source === 'string' &&
            dto.typeOptions.source !==
                property.typeOptions?.source;
        if (isFormulaTarget && (isTypeChange || sourceChanged)) {
            const sourceCandidate = dto.typeOptions?.source;
            if (typeof sourceCandidate !== 'string') {
                throw new common_1.BadRequestException('formula.source is required');
            }
            const allProps = await this.basePropertyRepo.findByPageId(dto.pageId);
            const compiled = this.formulaService.compile(sourceCandidate, allProps);
            const candidate = {
                id: property.id,
                type: 'formula',
                typeOptions: compiled,
            };
            const cycle = this.formulaService.detectCycle(candidate, allProps);
            if (cycle)
                throw new common_1.BadRequestException({ code: 'CYCLE', path: cycle });
            dto.typeOptions = compiled;
        }
        let validatedTypeOptions = property.typeOptions;
        if (dto.typeOptions !== undefined) {
            validatedTypeOptions = parseTypeOptionsOrThrow(newType, dto.typeOptions);
        }
        else if (isTypeChange) {
            const result = (0, property_type_registry_1.validateTypeOptions)(newType, {});
            validatedTypeOptions = result.success ? result.data : null;
        }
        const involvesSystem = (0, property_type_registry_1.isSystemPropertyType)(oldType) || (0, property_type_registry_1.isSystemPropertyType)(newType);
        const isPersonShapeChange = !isTypeChange &&
            newType === base_schemas_1.BasePropertyType.PERSON &&
            dto.typeOptions !== undefined &&
            (0, base_schemas_1.personAllowsMultiple)(validatedTypeOptions) !==
                (0, base_schemas_1.personAllowsMultiple)(oldTypeOptions);
        const needsCellRewrite = isTypeChange || isPersonShapeChange;
        if (!needsCellRewrite) {
            await this.mapDuplicateName(dto.name, () => (0, utils_1.executeTx)(this.db, async (trx) => {
                await this.basePropertyRepo.updateProperty(dto.pageId, dto.propertyId, {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.type !== undefined && { type: dto.type }),
                    typeOptions: validatedTypeOptions,
                }, trx);
                if (isTypeChange) {
                    await this.basePropertyRepo.bumpSchemaVersion(dto.pageId, dto.propertyId, trx);
                }
                await this.baseRepo.bumpSchemaVersion(dto.pageId, trx);
            }));
            if (newType === 'formula' && (isTypeChange || sourceChanged)) {
                await this.formulaService.enqueueRecompute({
                    pageId: dto.pageId,
                    workspaceId,
                    propertyIds: [dto.propertyId],
                    reason: isTypeChange ? 'formula_created' : 'formula_edited',
                    actorId: actorId ?? null,
                });
            }
            if (isTypeChange && newType !== 'formula') {
                const allProps = await this.basePropertyRepo.findByPageId(dto.pageId);
                const graph = new server_1.BaseFormulaGraph(allProps);
                const affected = graph.affectedFormulas([dto.propertyId]);
                if (affected.length > 0) {
                    await this.formulaService.enqueueRecompute({
                        pageId: dto.pageId,
                        workspaceId,
                        propertyIds: affected,
                        reason: 'dep_type_changed',
                        actorId: actorId ?? null,
                    });
                }
            }
            return this.loadAndEmit(dto, workspaceId, actorId, null);
        }
        const pendingToken = (0, node_crypto_1.randomUUID)();
        const conversionPayload = {
            pageId: dto.pageId,
            propertyId: dto.propertyId,
            workspaceId,
            fromType: oldType,
            toType: newType,
            fromTypeOptions: oldTypeOptions,
            toTypeOptions: validatedTypeOptions,
            clearMode: involvesSystem,
            actorId,
            pendingToken,
        };
        const backfillValue = (0, default_values_1.backfillDefaultForTypeChange)(oldType, newType, involvesSystem, validatedTypeOptions);
        const rowsToConvert = await this.countRowsToConvert(dto.pageId, workspaceId, dto.propertyId, { allRows: backfillValue != null });
        if (rowsToConvert <= INLINE_CONVERSION_ROW_LIMIT) {
            const schemaVersion = await this.mapDuplicateName(dto.name, () => (0, utils_1.executeTx)(this.db, async (trx) => {
                await this.basePropertyRepo.updateProperty(dto.pageId, dto.propertyId, {
                    ...(dto.name !== undefined && { name: dto.name }),
                    type: newType,
                    typeOptions: validatedTypeOptions,
                }, trx);
                await (0, base_type_conversion_task_1.processBaseTypeConversion)(this.db, this.baseRowRepo, conversionPayload, { trx });
                if (backfillValue != null) {
                    await this.baseRowRepo.seedEmptyCells(dto.propertyId, backfillValue, {
                        pageId: dto.pageId,
                        workspaceId,
                        trx,
                    });
                }
                await this.basePropertyRepo.bumpSchemaVersion(dto.pageId, dto.propertyId, trx);
                return this.baseRepo.bumpSchemaVersion(dto.pageId, trx);
            }));
            const bumpEvent = {
                pageId: dto.pageId,
                workspaceId,
                actorId: actorId ?? null,
                requestId: null,
                schemaVersion,
            };
            this.eventEmitter.emit(event_contants_1.EventName.BASE_SCHEMA_BUMPED, bumpEvent);
            return this.loadAndEmit(dto, workspaceId, actorId, null);
        }
        await this.mapDuplicateName(dto.name, () => (0, utils_1.executeTx)(this.db, async (trx) => {
            await this.basePropertyRepo.updateProperty(dto.pageId, dto.propertyId, {
                ...(dto.name !== undefined && { name: dto.name }),
                pendingType: newType,
                pendingTypeOptions: validatedTypeOptions,
                pendingToken,
            }, trx);
            await this.baseRepo.bumpSchemaVersion(dto.pageId, trx);
        }));
        let jobId = null;
        try {
            const job = await this.baseQueue.add(constants_1.QueueJob.BASE_TYPE_CONVERSION, conversionPayload, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
            jobId = String(job.id);
        }
        catch (err) {
            this.logger.error(`Enqueue of type-conversion failed for property ${dto.propertyId}; clearing pending state`, err);
            try {
                await this.basePropertyRepo.clearPendingTypeChange(dto.pageId, dto.propertyId, pendingToken);
                await this.baseRepo.bumpSchemaVersion(dto.pageId);
            }
            catch (revertErr) {
                this.logger.error(`Failed to clear pending state on ${dto.propertyId}. Manual intervention required.`, revertErr);
            }
            throw new common_1.ServiceUnavailableException('Type conversion queue unavailable. Property update rolled back.');
        }
        return this.loadAndEmit(dto, workspaceId, actorId, jobId);
    }
    async ensureNameUnique(pageId, candidate, excludePropertyId, trx) {
        const trimmed = candidate.trim();
        if (!trimmed)
            return;
        const existing = await this.basePropertyRepo.findByPageId(pageId, { trx });
        const lower = trimmed.toLowerCase();
        const clash = existing.find((p) => p.id !== excludePropertyId &&
            p.name.trim().toLowerCase() === lower);
        if (clash) {
            throw duplicateNameError(trimmed);
        }
    }
    async mapDuplicateName(name, work) {
        try {
            return await work();
        }
        catch (err) {
            if (name !== undefined && isUniqueViolation(err)) {
                throw duplicateNameError(name);
            }
            throw err;
        }
    }
    async revertDelete(pageId, propertyId, workspaceId, originalConfigs) {
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            await this.basePropertyRepo.updateProperty(pageId, propertyId, { deletedAt: null }, trx);
            for (const { id, config } of originalConfigs) {
                await this.baseViewRepo.updateView(id, { config: config }, { workspaceId, trx });
            }
            await trx
                .updateTable('pages')
                .set({
                baseSchemaVersion: (0, kysely_1.sql) `greatest(base_schema_version - 1, 1)`,
                updatedAt: new Date(),
            })
                .where('id', '=', pageId)
                .where('isBase', '=', true)
                .execute();
        });
    }
    async loadAndEmit(dto, workspaceId, actorId, jobId) {
        const updated = await this.basePropertyRepo.findById(dto.pageId, dto.propertyId);
        if (updated) {
            const event = {
                pageId: dto.pageId,
                workspaceId,
                actorId: actorId ?? null,
                requestId: dto.requestId ?? null,
                property: updated,
                schemaVersion: updated.schemaVersion,
            };
            this.eventEmitter.emit(event_contants_1.EventName.BASE_PROPERTY_UPDATED, event);
        }
        return { property: updated, jobId };
    }
    async countRowsToConvert(pageId, workspaceId, propertyId, opts) {
        let qb = this.db
            .selectFrom('baseRows')
            .select((0, kysely_1.sql) `count(*)`.as('n'))
            .where('pageId', '=', pageId)
            .where('workspaceId', '=', workspaceId)
            .where('deletedAt', 'is', null);
        if (!opts?.allRows) {
            qb = qb.where((0, kysely_1.sql) `cells ? ${propertyId}`);
        }
        const row = await qb.executeTakeFirst();
        return Number(row?.n ?? 0);
    }
    async delete(dto, workspaceId, actorId) {
        const property = await this.basePropertyRepo.findById(dto.pageId, dto.propertyId);
        if (!property) {
            throw new common_1.NotFoundException('Property not found');
        }
        if (property.isPrimary) {
            throw new common_1.BadRequestException('Cannot delete the primary property');
        }
        if (property.pendingType) {
            throw new common_1.ConflictException('Cannot delete a property while a type conversion is in progress');
        }
        const allProps = await this.basePropertyRepo.findByPageId(dto.pageId);
        const graph = new server_1.BaseFormulaGraph(allProps);
        const affected = graph.affectedFormulas([dto.propertyId]);
        const updatedViewIds = [];
        const originalConfigs = [];
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            await this.basePropertyRepo.softDelete(dto.pageId, dto.propertyId, trx);
            await this.baseRepo.bumpSchemaVersion(dto.pageId, trx);
            const views = await this.baseViewRepo.findByPageId(dto.pageId, {
                workspaceId,
                trx,
            });
            for (const view of views) {
                const next = (0, strip_property_from_view_config_1.stripPropertyFromViewConfig)(view.config, dto.propertyId);
                if (JSON.stringify(view.config ?? {}) === JSON.stringify(next)) {
                    continue;
                }
                originalConfigs.push({ id: view.id, config: view.config });
                await this.baseViewRepo.updateView(view.id, { config: next }, { workspaceId, trx });
                updatedViewIds.push(view.id);
            }
        });
        for (const viewId of updatedViewIds) {
            const fresh = await this.baseViewRepo.findById(viewId, { workspaceId });
            if (fresh) {
                const event = {
                    pageId: dto.pageId,
                    workspaceId,
                    actorId: actorId ?? null,
                    requestId: dto.requestId ?? null,
                    view: fresh,
                };
                this.eventEmitter.emit(event_contants_1.EventName.BASE_VIEW_UPDATED, event);
            }
        }
        const payload = {
            pageId: dto.pageId,
            propertyId: dto.propertyId,
            workspaceId,
        };
        try {
            await this.baseQueue.add(constants_1.QueueJob.BASE_CELL_GC, payload, { attempts: 2 });
        }
        catch (err) {
            this.logger.error(`Enqueue of cell-gc failed for property ${dto.propertyId}; reverting soft-delete`, err);
            try {
                await this.revertDelete(dto.pageId, dto.propertyId, workspaceId, originalConfigs);
            }
            catch (revertErr) {
                this.logger.error(`Revert failed for property ${dto.propertyId}. Manual intervention required.`, revertErr);
            }
            throw new common_1.ServiceUnavailableException('Cell-GC queue unavailable. Property delete rolled back.');
        }
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: actorId ?? null,
            requestId: dto.requestId ?? null,
            propertyId: dto.propertyId,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_PROPERTY_DELETED, event);
        if (affected.length > 0) {
            await this.formulaService.enqueueRecompute({
                pageId: dto.pageId,
                workspaceId,
                propertyIds: affected,
                reason: 'dep_deleted',
                actorId: actorId ?? null,
            });
        }
    }
    async reorder(dto, workspaceId, actorId) {
        const property = await this.basePropertyRepo.findById(dto.pageId, dto.propertyId);
        if (!property) {
            throw new common_1.NotFoundException('Property not found');
        }
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            await this.basePropertyRepo.updateProperty(dto.pageId, dto.propertyId, { position: dto.position }, trx);
            await this.baseRepo.bumpSchemaVersion(dto.pageId, trx);
        });
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: actorId ?? null,
            requestId: dto.requestId ?? null,
            propertyId: dto.propertyId,
            position: dto.position,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_PROPERTY_REORDERED, event);
    }
};
exports.BasePropertyService = BasePropertyService;
exports.BasePropertyService = BasePropertyService = BasePropertyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(5, (0, bullmq_1.InjectQueue)(constants_1.QueueName.BASE_QUEUE)),
    __metadata("design:paramtypes", [Object, base_property_repo_1.BasePropertyRepo,
        base_row_repo_1.BaseRowRepo,
        base_repo_1.BaseRepo,
        base_view_repo_1.BaseViewRepo,
        bullmq_2.Queue,
        event_emitter_1.EventEmitter2,
        formula_service_1.FormulaService])
], BasePropertyService);
function parseTypeOptionsOrThrow(type, typeOptions) {
    try {
        const parsed = (0, property_type_registry_1.parseTypeOptions)(type, typeOptions);
        if (type === base_schemas_1.BasePropertyType.SELECT ||
            type === base_schemas_1.BasePropertyType.STATUS ||
            type === base_schemas_1.BasePropertyType.MULTI_SELECT) {
            return (0, default_values_1.normalizeSelectDefaultValue)(parsed, { multi: type === base_schemas_1.BasePropertyType.MULTI_SELECT });
        }
        if (type === base_schemas_1.BasePropertyType.PERSON) {
            return (0, default_values_1.normalizePersonDefaultValue)(parsed);
        }
        return parsed;
    }
    catch (err) {
        throw new common_1.BadRequestException({
            message: 'Invalid typeOptions',
            issues: err?.issues ?? [],
        });
    }
}
function isUniqueViolation(err) {
    return err?.code === '23505';
}
function duplicateNameError(name) {
    return new common_1.BadRequestException(`A property named "${name.trim()}" already exists in this base`);
}
//# sourceMappingURL=base-property.service.js.map