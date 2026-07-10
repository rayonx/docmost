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
exports.BaseRowRepo = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const utils_1 = require("../../../database/utils");
const cursor_pagination_1 = require("../../../database/pagination/cursor-pagination");
const kysely_1 = require("kysely");
const engine_1 = require("../engine");
const BASE_ROW_COLUMNS = [
    'id',
    'pageId',
    'cells',
    'position',
    'creatorId',
    'lastUpdatedById',
    'workspaceId',
    'createdAt',
    'updatedAt',
    'deletedAt',
];
let BaseRowRepo = class BaseRowRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(rowId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        let qb = db
            .selectFrom('baseRows')
            .select(BASE_ROW_COLUMNS)
            .where('id', '=', rowId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null);
        if (opts.forUpdate) {
            qb = qb.forUpdate();
        }
        return (await qb.executeTakeFirst());
    }
    async findByIds(rowIds, opts) {
        if (rowIds.length === 0)
            return [];
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        return (await db
            .selectFrom('baseRows')
            .select(BASE_ROW_COLUMNS)
            .where('id', 'in', rowIds)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null)
            .execute());
    }
    async list(opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        const base = db
            .selectFrom('baseRows')
            .select(BASE_ROW_COLUMNS)
            .where('pageId', '=', opts.pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null);
        const hasFilterOrSort = !!opts.filter || (opts.sorts && opts.sorts.length > 0);
        if (!hasFilterOrSort) {
            return (0, cursor_pagination_1.executeWithCursorPagination)(base, {
                perPage: opts.pagination.limit,
                cursor: opts.pagination.cursor,
                beforeCursor: opts.pagination.beforeCursor,
                fields: [
                    {
                        expression: (0, kysely_1.sql) `position COLLATE "C"`,
                        direction: 'asc',
                        key: 'position',
                    },
                    { expression: 'id', direction: 'asc', key: 'id' },
                ],
                parseCursor: (c) => ({
                    position: c.position,
                    id: c.id,
                }),
            });
        }
        return (0, engine_1.runListQuery)(base, {
            filter: opts.filter,
            sorts: opts.sorts,
            schema: opts.schema,
            pagination: opts.pagination,
        });
    }
    async count(opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        let qb = db
            .selectFrom('baseRows')
            .select((0, kysely_1.sql) `count(*)`.as('count'))
            .where('pageId', '=', opts.pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null);
        if (opts.filter) {
            const filter = opts.filter;
            const schema = opts.schema;
            qb = qb.where((eb) => (0, engine_1.buildWhere)(eb, filter, schema));
        }
        const row = await qb.executeTakeFirst();
        return Number(row?.count ?? 0);
    }
    async groupCounts(opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        const groupExpr = (0, engine_1.textCell)(opts.groupByPropertyId);
        let qb = db
            .selectFrom('baseRows')
            .select((eb) => [
            groupExpr.as('value'),
            eb.fn.countAll().as('count'),
        ])
            .where('pageId', '=', opts.pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null);
        if (opts.filter) {
            const filter = opts.filter;
            const schema = opts.schema;
            qb = qb.where((eb) => (0, engine_1.buildWhere)(eb, filter, schema));
        }
        const rows = await qb.groupBy((0, kysely_1.sql) `1`).execute();
        return rows.map((r) => ({
            value: r.value,
            count: Number(r.count),
        }));
    }
    async getLastPosition(pageId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        const result = await db
            .selectFrom('baseRows')
            .select('position')
            .where('pageId', '=', pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null)
            .orderBy((0, kysely_1.sql) `position COLLATE "C"`, 'desc')
            .limit(1)
            .executeTakeFirst();
        return result?.position ?? null;
    }
    async getNextPosition(pageId, after, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        const result = await db
            .selectFrom('baseRows')
            .select('position')
            .where('pageId', '=', pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null)
            .where((eb) => eb.or([
            eb((0, kysely_1.sql) `position COLLATE "C"`, '>', after.position),
            eb.and([
                eb((0, kysely_1.sql) `position COLLATE "C"`, '=', after.position),
                eb('id', '>', after.id),
            ]),
        ]))
            .orderBy((0, kysely_1.sql) `position COLLATE "C"`, 'asc')
            .orderBy('id', 'asc')
            .limit(1)
            .executeTakeFirst();
        return result?.position ?? null;
    }
    async insertRow(row, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        return (await db
            .insertInto('baseRows')
            .values(row)
            .returning(BASE_ROW_COLUMNS)
            .executeTakeFirstOrThrow());
    }
    async updateCells(rowId, patch, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        const patchJson = JSON.stringify(patch);
        return (await db
            .updateTable('baseRows')
            .set({
            cells: (0, kysely_1.sql) `jsonb_set_many(cells, ${patchJson}::text::jsonb)`,
            ...(opts.position !== undefined && { position: opts.position }),
            updatedAt: new Date(),
            lastUpdatedById: opts.actorId ?? null,
        })
            .where('id', '=', rowId)
            .where('pageId', '=', opts.pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null)
            .returning(BASE_ROW_COLUMNS)
            .executeTakeFirst());
    }
    async updatePosition(rowId, position, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        await db
            .updateTable('baseRows')
            .set({ position, updatedAt: new Date() })
            .where('id', '=', rowId)
            .where('pageId', '=', opts.pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null)
            .execute();
    }
    async deleteRow(rowId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        await db
            .deleteFrom('baseRows')
            .where('id', '=', rowId)
            .where('pageId', '=', opts.pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .execute();
    }
    async deleteRows(rowIds, opts) {
        if (rowIds.length === 0)
            return;
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        await db
            .deleteFrom('baseRows')
            .where('id', 'in', rowIds)
            .where('pageId', '=', opts.pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .execute();
    }
    async removeCellKey(pageId, propertyId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        await db
            .updateTable('baseRows')
            .set({
            cells: (0, kysely_1.sql) `cells - ${propertyId}::text`,
            updatedAt: new Date(),
        })
            .where('pageId', '=', pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null)
            .where((0, kysely_1.sql) `cells ? ${propertyId}`)
            .execute();
    }
    async removeCellKeyByIds(rowIds, propertyId, opts) {
        if (rowIds.length === 0)
            return;
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        await db
            .updateTable('baseRows')
            .set({
            cells: (0, kysely_1.sql) `cells - ${propertyId}::text`,
            updatedAt: new Date(),
        })
            .where('id', 'in', rowIds)
            .where('pageId', '=', opts.pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .where('deletedAt', 'is', null)
            .where((0, kysely_1.sql) `cells ? ${propertyId}`)
            .execute();
    }
    async *streamByPageId(pageId, opts) {
        const chunkSize = opts.chunkSize ?? 1000;
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        let afterPosition = null;
        let afterId = null;
        while (true) {
            let qb = db
                .selectFrom('baseRows')
                .select(BASE_ROW_COLUMNS)
                .where('pageId', '=', pageId)
                .where('workspaceId', '=', opts.workspaceId)
                .where('deletedAt', 'is', null)
                .orderBy((0, kysely_1.sql) `position COLLATE "C"`, 'asc')
                .orderBy('id', 'asc')
                .limit(chunkSize);
            if (opts.withCellKey) {
                qb = qb.where((0, kysely_1.sql) `cells ? ${opts.withCellKey}`);
            }
            if (afterPosition !== null && afterId !== null) {
                qb = qb.where((eb) => eb.or([
                    eb((0, kysely_1.sql) `position COLLATE "C"`, '>', afterPosition),
                    eb.and([
                        eb((0, kysely_1.sql) `position COLLATE "C"`, '=', afterPosition),
                        eb('id', '>', afterId),
                    ]),
                ]));
            }
            const chunk = (await qb.execute());
            if (chunk.length === 0)
                return;
            yield chunk;
            if (chunk.length < chunkSize)
                return;
            const last = chunk[chunk.length - 1];
            afterPosition = last.position;
            afterId = last.id;
        }
    }
    async batchUpdateCells(updates, opts) {
        if (updates.length === 0)
            return;
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        const ids = updates.map((u) => u.id);
        const patches = updates.map((u) => JSON.stringify(u.patch));
        await (0, kysely_1.sql) `
      UPDATE base_rows AS r
      SET cells              = jsonb_set_many(r.cells, u.patch::jsonb),
          updated_at         = now(),
          last_updated_by_id = coalesce(${opts.actorId ?? null}, r.last_updated_by_id)
      FROM unnest(${ids}::uuid[], ${patches}::text[]) AS u(row_id, patch)
      WHERE r.id = u.row_id
        AND r.page_id = ${opts.pageId}
        AND r.workspace_id = ${opts.workspaceId}
        AND r.deleted_at IS NULL
    `.execute(db);
    }
    async seedEmptyCells(propertyId, value, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        await (0, kysely_1.sql) `
      UPDATE base_rows AS r
      SET cells = jsonb_set(
        coalesce(r.cells, '{}'::jsonb),
        ARRAY[${propertyId}],
        ${JSON.stringify(value)}::text::jsonb,
        true
      )
      WHERE r.page_id = ${opts.pageId}
        AND r.workspace_id = ${opts.workspaceId}
        AND r.deleted_at IS NULL
        AND (
          r.cells IS NULL
          OR NOT (r.cells ? ${propertyId})
          OR r.cells -> ${propertyId} = 'null'::jsonb
        )
    `.execute(db);
    }
};
exports.BaseRowRepo = BaseRowRepo;
exports.BaseRowRepo = BaseRowRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], BaseRowRepo);
//# sourceMappingURL=base-row.repo.js.map