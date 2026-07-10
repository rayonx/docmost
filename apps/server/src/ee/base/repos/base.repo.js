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
exports.BaseRepo = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const kysely_1 = require("kysely");
const postgres_1 = require("kysely/helpers/postgres");
const utils_1 = require("../../../database/utils");
const cursor_pagination_1 = require("../../../database/pagination/cursor-pagination");
const BASE_PAGE_COLUMNS = [
    'id',
    'slugId',
    'title',
    'icon',
    'isBase',
    'baseSchemaVersion',
    'spaceId',
    'parentPageId',
    'workspaceId',
    'creatorId',
    'lastUpdatedById',
    'position',
    'isLocked',
    'coverPhoto',
    'contributorIds',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'deletedById',
];
let BaseRepo = class BaseRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(pageId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        let query = db
            .selectFrom('pages')
            .select(BASE_PAGE_COLUMNS)
            .where('id', '=', pageId)
            .where('isBase', '=', true)
            .where('deletedAt', 'is', null);
        if (opts?.includeProperties) {
            query = query.select((eb) => this.withProperties(eb));
        }
        if (opts?.includeViews) {
            query = query.select((eb) => this.withViews(eb));
        }
        return query.executeTakeFirst();
    }
    async findBySpaceId(spaceId, pagination, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        const query = db
            .selectFrom('pages')
            .select(BASE_PAGE_COLUMNS)
            .where('spaceId', '=', spaceId)
            .where('isBase', '=', true)
            .where('deletedAt', 'is', null);
        return (0, cursor_pagination_1.executeWithCursorPagination)(query, {
            perPage: pagination.limit,
            cursor: pagination.cursor,
            beforeCursor: pagination.beforeCursor,
            fields: [
                { expression: 'createdAt', direction: 'desc' },
                { expression: 'id', direction: 'desc' },
            ],
            parseCursor: (cursor) => ({
                createdAt: new Date(cursor.createdAt),
                id: cursor.id,
            }),
        });
    }
    async softDelete(pageId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        await db
            .updateTable('pages')
            .set({ deletedAt: new Date() })
            .where('id', '=', pageId)
            .where('isBase', '=', true)
            .execute();
    }
    async bumpSchemaVersion(pageId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        const result = await db
            .updateTable('pages')
            .set({
            baseSchemaVersion: (0, kysely_1.sql) `base_schema_version + 1`,
            updatedAt: new Date(),
        })
            .where('id', '=', pageId)
            .where('isBase', '=', true)
            .returning('baseSchemaVersion')
            .executeTakeFirst();
        return result?.baseSchemaVersion ?? 0;
    }
    withProperties(eb) {
        return (0, postgres_1.jsonArrayFrom)(eb
            .selectFrom('baseProperties')
            .selectAll('baseProperties')
            .whereRef('baseProperties.pageId', '=', 'pages.id')
            .where('baseProperties.deletedAt', 'is', null)
            .orderBy((0, kysely_1.sql) `base_properties.position COLLATE "C"`, 'asc')).as('properties');
    }
    withViews(eb) {
        return (0, postgres_1.jsonArrayFrom)(eb
            .selectFrom('baseViews')
            .selectAll('baseViews')
            .whereRef('baseViews.pageId', '=', 'pages.id')
            .orderBy((0, kysely_1.sql) `base_views.position COLLATE "C"`, 'asc')).as('views');
    }
};
exports.BaseRepo = BaseRepo;
exports.BaseRepo = BaseRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], BaseRepo);
//# sourceMappingURL=base.repo.js.map