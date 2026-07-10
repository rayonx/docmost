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
exports.BaseService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const utils_1 = require("../../../database/utils");
const base_repo_1 = require("../repos/base.repo");
const base_property_repo_1 = require("../repos/base-property.repo");
const base_view_repo_1 = require("../repos/base-view.repo");
const page_service_1 = require("../../../core/page/services/page.service");
const page_repo_1 = require("../../../database/repos/page/page.repo");
const base_schemas_1 = require("../base.schemas");
const fractional_indexing_jittered_1 = require("fractional-indexing-jittered");
const nanoid_utils_1 = require("../../../common/helpers/nanoid.utils");
let BaseService = class BaseService {
    constructor(db, baseRepo, basePropertyRepo, baseViewRepo, pageService, pageRepo) {
        this.db = db;
        this.baseRepo = baseRepo;
        this.basePropertyRepo = basePropertyRepo;
        this.baseViewRepo = baseViewRepo;
        this.pageService = pageService;
        this.pageRepo = pageRepo;
    }
    async create(userId, workspaceId, dto, defaults = {}) {
        return (0, utils_1.executeTx)(this.db, async (trx) => {
            const page = await this.pageService.create(userId, workspaceId, {
                title: dto.name ?? '',
                icon: dto.icon,
                spaceId: dto.spaceId,
                parentPageId: dto.parentPageId,
            }, trx, true);
            const firstPosition = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(null, null);
            await this.basePropertyRepo.insertProperty({
                pageId: page.id,
                name: 'Title',
                type: base_schemas_1.BasePropertyType.TEXT,
                position: firstPosition,
                isPrimary: true,
                workspaceId,
            }, trx);
            if (defaults.template === 'kanban') {
                await this.seedKanbanTemplate(trx, page.id, workspaceId, userId, firstPosition);
                return this.baseRepo.findById(page.id, {
                    includeProperties: true,
                    includeViews: true,
                    trx,
                });
            }
            await this.baseViewRepo.insertView({
                pageId: page.id,
                name: 'Table',
                type: base_schemas_1.BaseViewType.TABLE,
                position: firstPosition,
                config: {},
                workspaceId,
                creatorId: userId,
            }, { trx });
            return this.baseRepo.findById(page.id, {
                includeProperties: true,
                includeViews: true,
                trx,
            });
        });
    }
    async convertPageToBase(page, userId, template) {
        return (0, utils_1.executeTx)(this.db, async (trx) => {
            if (!page.isBase) {
                await this.pageRepo.updatePage({ isBase: true }, page.id, trx);
                const firstPosition = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(null, null);
                await this.basePropertyRepo.insertProperty({
                    pageId: page.id,
                    name: 'Title',
                    type: base_schemas_1.BasePropertyType.TEXT,
                    position: firstPosition,
                    isPrimary: true,
                    workspaceId: page.workspaceId,
                }, trx);
                if (template === 'kanban') {
                    await this.seedKanbanTemplate(trx, page.id, page.workspaceId, userId, firstPosition);
                }
                else {
                    await this.baseViewRepo.insertView({
                        pageId: page.id,
                        name: 'Table',
                        type: base_schemas_1.BaseViewType.TABLE,
                        position: firstPosition,
                        config: {},
                        workspaceId: page.workspaceId,
                        creatorId: userId,
                    }, { trx });
                }
            }
            return this.baseRepo.findById(page.id, {
                includeProperties: true,
                includeViews: true,
                trx,
            });
        });
    }
    async seedKanbanTemplate(trx, pageId, workspaceId, userId, titlePosition) {
        const notStarted = (0, nanoid_utils_1.generateBaseChoiceId)();
        const inProgress = (0, nanoid_utils_1.generateBaseChoiceId)();
        const done = (0, nanoid_utils_1.generateBaseChoiceId)();
        const statusProperty = await this.basePropertyRepo.insertProperty({
            pageId,
            name: 'Status',
            type: base_schemas_1.BasePropertyType.STATUS,
            position: (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(titlePosition, null),
            isPrimary: false,
            workspaceId,
            typeOptions: {
                choices: [
                    {
                        id: notStarted,
                        name: 'Not started',
                        color: 'gray',
                        category: 'todo',
                    },
                    {
                        id: inProgress,
                        name: 'In progress',
                        color: 'blue',
                        category: 'inProgress',
                    },
                    { id: done, name: 'Done', color: 'green', category: 'complete' },
                ],
                choiceOrder: [notStarted, inProgress, done],
                defaultValue: notStarted,
            },
        }, trx);
        await this.baseViewRepo.insertView({
            pageId,
            name: 'Kanban',
            type: base_schemas_1.BaseViewType.KANBAN,
            position: titlePosition,
            config: { groupByPropertyId: statusProperty.id },
            workspaceId,
            creatorId: userId,
        }, { trx });
    }
    async getBaseInfo(pageId) {
        const base = await this.baseRepo.findById(pageId, {
            includeProperties: true,
            includeViews: true,
        });
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        return base;
    }
    async update(dto) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.pageRepo.updatePage({
            ...(dto.name !== undefined && { title: dto.name }),
            ...(dto.icon !== undefined && { icon: dto.icon }),
        }, dto.pageId);
        return this.baseRepo.findById(dto.pageId);
    }
    async delete(pageId) {
        const base = await this.baseRepo.findById(pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.baseRepo.softDelete(pageId);
    }
    async listBySpaceId(spaceId, pagination) {
        return this.baseRepo.findBySpaceId(spaceId, pagination);
    }
};
exports.BaseService = BaseService;
exports.BaseService = BaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, base_repo_1.BaseRepo,
        base_property_repo_1.BasePropertyRepo,
        base_view_repo_1.BaseViewRepo,
        page_service_1.PageService,
        page_repo_1.PageRepo])
], BaseService);
//# sourceMappingURL=base.service.js.map