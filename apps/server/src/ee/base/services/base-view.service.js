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
exports.BaseViewService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const utils_1 = require("../../../database/utils");
const event_emitter_1 = require("@nestjs/event-emitter");
const base_view_repo_1 = require("../repos/base-view.repo");
const base_schemas_1 = require("../base.schemas");
const merge_view_config_1 = require("./merge-view-config");
const fractional_indexing_jittered_1 = require("fractional-indexing-jittered");
const event_contants_1 = require("../../../common/events/event.contants");
let BaseViewService = class BaseViewService {
    constructor(db, baseViewRepo, eventEmitter) {
        this.db = db;
        this.baseViewRepo = baseViewRepo;
        this.eventEmitter = eventEmitter;
    }
    async create(userId, workspaceId, dto) {
        let validatedConfig = {};
        if (dto.config) {
            const result = base_schemas_1.viewConfigSchema.safeParse(dto.config);
            if (!result.success) {
                throw new common_1.BadRequestException({
                    message: 'Invalid view config',
                    errors: result.error.issues.map((i) => i.message),
                });
            }
            validatedConfig = result.data;
        }
        const lastPosition = await this.baseViewRepo.getLastPosition(dto.pageId, {
            workspaceId,
        });
        const position = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(lastPosition, null);
        const created = await this.baseViewRepo.insertView({
            pageId: dto.pageId,
            name: dto.name,
            type: dto.type ?? base_schemas_1.BaseViewType.TABLE,
            position,
            config: validatedConfig,
            workspaceId,
            creatorId: userId,
        });
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: userId,
            requestId: null,
            view: created,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_VIEW_CREATED, event);
        return created;
    }
    async update(dto, workspaceId, userId) {
        const view = await this.baseViewRepo.findById(dto.viewId, { workspaceId });
        if (!view || view.pageId !== dto.pageId) {
            throw new common_1.NotFoundException('View not found');
        }
        let validatedPatch = undefined;
        if (dto.config !== undefined) {
            const result = base_schemas_1.viewConfigPatchSchema.safeParse(dto.config);
            if (!result.success) {
                throw new common_1.BadRequestException({
                    message: 'Invalid view config',
                    errors: result.error.issues.map((i) => i.message),
                });
            }
            validatedPatch = result.data;
        }
        if (dto.position !== undefined) {
            try {
                (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(dto.position, null);
            }
            catch {
                throw new common_1.BadRequestException('Invalid position value');
            }
        }
        await this.baseViewRepo.updateView(dto.viewId, {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.type !== undefined && { type: dto.type }),
            ...(validatedPatch !== undefined && {
                config: (0, merge_view_config_1.mergeViewConfig)(view.config, validatedPatch),
            }),
            ...(dto.position !== undefined && { position: dto.position }),
        }, { workspaceId });
        const updated = await this.baseViewRepo.findById(dto.viewId, {
            workspaceId,
        });
        if (updated) {
            const event = {
                pageId: dto.pageId,
                workspaceId,
                actorId: userId ?? null,
                requestId: null,
                view: updated,
            };
            this.eventEmitter.emit(event_contants_1.EventName.BASE_VIEW_UPDATED, event);
        }
        return updated;
    }
    async delete(dto, workspaceId, userId) {
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            const ids = await this.baseViewRepo.lockViewIdsByPageId(dto.pageId, {
                workspaceId,
                trx,
            });
            if (!ids.includes(dto.viewId)) {
                throw new common_1.NotFoundException('View not found');
            }
            if (ids.length <= 1) {
                throw new common_1.BadRequestException('Cannot delete the last view');
            }
            await this.baseViewRepo.deleteView(dto.viewId, { workspaceId, trx });
        });
        const event = {
            pageId: dto.pageId,
            workspaceId,
            actorId: userId ?? null,
            requestId: null,
            viewId: dto.viewId,
        };
        this.eventEmitter.emit(event_contants_1.EventName.BASE_VIEW_DELETED, event);
    }
    async listByBaseId(pageId, workspaceId) {
        return this.baseViewRepo.findByPageId(pageId, { workspaceId });
    }
};
exports.BaseViewService = BaseViewService;
exports.BaseViewService = BaseViewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, base_view_repo_1.BaseViewRepo,
        event_emitter_1.EventEmitter2])
], BaseViewService);
//# sourceMappingURL=base-view.service.js.map