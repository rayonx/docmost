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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRowService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const event_emitter_1 = require("@nestjs/event-emitter");
const utils_1 = require("../../../database/utils");
const base_row_repo_1 = require("../repos/base-row.repo");
const base_view_repo_1 = require("../repos/base-view.repo");
const property_type_registry_1 = require("../property-types/property-type.registry");
const default_values_1 = require("../property-types/default-values");
const fractional_indexing_jittered_1 = require("fractional-indexing-jittered");
const engine_1 = require("../engine");
const event_contants_1 = require("../../../common/events/event.contants");
const formula_service_1 = require("../formula/formula.service");
const base_page_resolver_service_1 = require("./base-page-resolver.service");
const base_schema_cache_service_1 = require("./base-schema-cache.service");
const reference_expansion_1 = require("../reference/reference-expansion");
let BaseRowService = class BaseRowService {
    constructor(db, baseRowRepo, baseViewRepo, eventEmitter, formulaService, basePageResolver, baseSchemaCache) {
        this.db = db;
        this.baseRowRepo = baseRowRepo;
        this.baseViewRepo = baseViewRepo;
        this.eventEmitter = eventEmitter;
        this.formulaService = formulaService;
        this.basePageResolver = basePageResolver;
        this.baseSchemaCache = baseSchemaCache;
    }
    async create(userId, workspaceId, dto, schemaVersion) {
        let position;
        if (dto.position) {
            position = dto.position;
        }
        else if (dto.afterRowId) {
            const afterRow = await this.baseRowRepo.findById(dto.afterRowId, {
                workspaceId,
            });
            if (!afterRow || afterRow.pageId !== dto.pageId) {
                throw new common_1.BadRequestException('Invalid afterRowId');
            }
            const nextPosition = await this.baseRowRepo.getNextPosition(dto.pageId, { position: afterRow.position, id: afterRow.id }, { workspaceId });
            position = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(afterRow.position, nextPosition !== afterRow.position ? nextPosition : null);
        }
        else {
            const lastPosition = await this.baseRowRepo.getLastPosition(dto.pageId, {
                workspaceId,
            });
            position = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(lastPosition, null);
        }
        const properties = await this.baseSchemaCache.getProperties(dto.pageId, schemaVersion);
        let validatedCells = {};
        if (dto.cells && Object.keys(dto.cells).length > 0) {
            validatedCells = this.validateCells(dto.cells, properties);
        }
        const defaultCells = (0, default_values_1.buildDefaultCells)(properties, validatedCells);
        const seededCells = { ...defaultCells, ...validatedCells };
        const formulaPatch = this.formulaService.evaluateInline({
            properties,
            row: seededCells,
            dirtyProps: 'all',
        });
        const finalCells = { ...seededCells, ...formulaPatch };
        const created = await this.baseRowRepo.insertRow({
            pageId: dto.pageId,
            cells: finalCells,
            position,
            creatorId: userId,
            workspaceId,
        });
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: userId,
            requestId: dto.requestId ?? null,
            row: created,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_ROW_CREATED, event);
        return created;
    }
    async getRowInfo(rowId, pageId, workspaceId) {
        const row = await this.baseRowRepo.findById(rowId, { workspaceId });
        if (!row || row.pageId !== pageId) {
            throw new common_1.NotFoundException('Row not found');
        }
        return row;
    }
    async update(dto, workspaceId, userId, schemaVersion) {
        const properties = await this.baseSchemaCache.getProperties(dto.pageId, schemaVersion);
        const validatedCells = this.validateCells(dto.cells, properties);
        if (dto.position !== undefined) {
            try {
                (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(dto.position, null);
            }
            catch {
                throw new common_1.BadRequestException('Invalid position value');
            }
        }
        const hasFormulas = properties.some((p) => p.type === 'formula');
        let finalCells = validatedCells;
        let updated;
        if (!hasFormulas) {
            updated = await this.baseRowRepo.updateCells(dto.rowId, validatedCells, {
                pageId: dto.pageId,
                workspaceId,
                actorId: userId,
                position: dto.position,
            });
        }
        else {
            updated = await (0, utils_1.executeTx)(this.db, async (trx) => {
                const existing = await this.baseRowRepo.findById(dto.rowId, {
                    workspaceId,
                    trx,
                    forUpdate: true,
                });
                if (!existing || existing.pageId !== dto.pageId)
                    return undefined;
                const mergedRow = {
                    ...(existing.cells ?? {}),
                    ...validatedCells,
                };
                const formulaPatch = this.formulaService.evaluateInline({
                    properties,
                    row: mergedRow,
                    dirtyProps: Object.keys(validatedCells),
                });
                finalCells = { ...validatedCells, ...formulaPatch };
                return this.baseRowRepo.updateCells(dto.rowId, finalCells, {
                    pageId: dto.pageId,
                    workspaceId,
                    actorId: userId,
                    position: dto.position,
                    trx,
                });
            });
        }
        if (!updated) {
            throw new common_1.NotFoundException('Row not found');
        }
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: userId ?? null,
            requestId: dto.requestId ?? null,
            rowId: dto.rowId,
            patch: dto.cells,
            updatedCells: finalCells,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_ROW_UPDATED, event);
        return updated;
    }
    async delete(dto, workspaceId, userId) {
        const row = await this.baseRowRepo.findById(dto.rowId, { workspaceId });
        if (!row || row.pageId !== dto.pageId) {
            throw new common_1.NotFoundException('Row not found');
        }
        await this.baseRowRepo.deleteRow(dto.rowId, {
            pageId: dto.pageId,
            workspaceId,
        });
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: userId ?? null,
            requestId: dto.requestId ?? null,
            rowId: dto.rowId,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_ROW_DELETED, event);
    }
    async deleteMany(dto, workspaceId, userId) {
        const rows = await this.baseRowRepo.findByIds(dto.rowIds, { workspaceId });
        const rowIds = rows
            .filter((r) => r.pageId === dto.pageId)
            .map((r) => r.id);
        if (rowIds.length === 0)
            return;
        await this.baseRowRepo.deleteRows(rowIds, {
            pageId: dto.pageId,
            workspaceId,
        });
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: userId ?? null,
            requestId: dto.requestId ?? null,
            rowIds,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_ROWS_DELETED, event);
    }
    async list(dto, pagination, workspaceId, userId, schemaVersion) {
        const properties = await this.baseSchemaCache.getProperties(dto.pageId, schemaVersion);
        const schema = new Map(properties.map((p) => [p.id, p]));
        const filter = this.normaliseFilter(dto);
        const sorts = this.normaliseSorts(dto.sorts);
        const result = await this.baseRowRepo.list({
            pageId: dto.pageId,
            workspaceId,
            filter,
            sorts,
            schema,
            pagination,
        });
        const references = await (0, reference_expansion_1.buildRowReferences)({
            db: this.db,
            rows: result.items,
            properties,
            workspaceId,
            userId,
            resolvePages: (ids, ws, uid) => this.basePageResolver.resolvePages(ids, ws, uid),
        });
        return { ...result, references };
    }
    async count(dto, workspaceId, schemaVersion) {
        const properties = await this.baseSchemaCache.getProperties(dto.pageId, schemaVersion);
        const schema = new Map(properties.map((p) => [p.id, p]));
        const count = await this.baseRowRepo.count({
            pageId: dto.pageId,
            workspaceId,
            filter: this.normaliseFilter({ filter: dto.filter }),
            schema,
        });
        return { count };
    }
    async groupCounts(dto, workspaceId, schemaVersion) {
        const properties = await this.baseSchemaCache.getProperties(dto.pageId, schemaVersion);
        const schema = new Map(properties.map((p) => [p.id, p]));
        const counts = await this.baseRowRepo.groupCounts({
            pageId: dto.pageId,
            workspaceId,
            groupByPropertyId: dto.groupByPropertyId,
            filter: this.normaliseFilter({ filter: dto.filter }),
            schema,
        });
        return { counts };
    }
    async reorder(dto, workspaceId, userId) {
        const row = await this.baseRowRepo.findById(dto.rowId, { workspaceId });
        if (!row || row.pageId !== dto.pageId) {
            throw new common_1.NotFoundException('Row not found');
        }
        try {
            (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(dto.position, null);
        }
        catch {
            throw new common_1.BadRequestException('Invalid position value');
        }
        await this.baseRowRepo.updatePosition(dto.rowId, dto.position, {
            pageId: dto.pageId,
            workspaceId,
        });
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: userId ?? null,
            requestId: dto.requestId ?? null,
            rowId: dto.rowId,
            position: dto.position,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_ROW_REORDERED, event);
    }
    normaliseFilter(dto) {
        if (!dto.filter)
            return undefined;
        const parsed = engine_1.filterGroupSchema.safeParse(dto.filter);
        if (!parsed.success) {
            throw new common_1.BadRequestException({
                message: 'Invalid filter tree',
                issues: parsed.error.issues,
            });
        }
        try {
            (0, engine_1.validateFilterTree)(parsed.data);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
        return parsed.data;
    }
    normaliseSorts(raw) {
        if (raw == null)
            return undefined;
        const parsed = engine_1.sortsSchema.safeParse(raw);
        if (!parsed.success) {
            throw new common_1.BadRequestException({
                message: 'Invalid sorts',
                issues: parsed.error.issues,
            });
        }
        return parsed.data;
    }
    validateCells(cells, properties) {
        const propertyMap = new Map(properties.map((p) => [p.id, p]));
        const validatedCells = {};
        const errors = [];
        for (const [propertyId, value] of Object.entries(cells)) {
            const property = propertyMap.get(propertyId);
            if (!property) {
                errors.push(`Unknown property: ${propertyId}`);
                continue;
            }
            if (property.pendingType) {
                errors.push(`Property "${property.name}" has a type conversion in progress`);
                continue;
            }
            if ((0, property_type_registry_1.isSystemPropertyType)(property.type)) {
                continue;
            }
            if (value === null || value === undefined) {
                validatedCells[propertyId] = null;
                continue;
            }
            const result = (0, property_type_registry_1.validateCellValue)(property.type, value, property.typeOptions);
            if (!result.success) {
                errors.push(`Invalid value for property "${property.name}" (${property.type}): ${result.error.issues[0]?.message}`);
                continue;
            }
            validatedCells[propertyId] = result.data;
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Cell validation failed',
                errors,
            });
        }
        return validatedCells;
    }
};
exports.BaseRowService = BaseRowService;
exports.BaseRowService = BaseRowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, base_row_repo_1.BaseRowRepo,
        base_view_repo_1.BaseViewRepo,
        event_emitter_1.EventEmitter2,
        formula_service_1.FormulaService,
        base_page_resolver_service_1.BasePageResolverService,
        base_schema_cache_service_1.BaseSchemaCacheService])
], BaseRowService);
//# sourceMappingURL=base-row.service.js.map