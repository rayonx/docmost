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
exports.BaseViewRepo = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const utils_1 = require("../../../database/utils");
const kysely_1 = require("kysely");
let BaseViewRepo = class BaseViewRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(viewId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        return db
            .selectFrom('baseViews')
            .selectAll()
            .where('id', '=', viewId)
            .where('workspaceId', '=', opts.workspaceId)
            .executeTakeFirst();
    }
    async findByPageId(pageId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        return db
            .selectFrom('baseViews')
            .selectAll()
            .where('pageId', '=', pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .orderBy((0, kysely_1.sql) `position COLLATE "C"`, 'asc')
            .execute();
    }
    async lockViewIdsByPageId(pageId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        const rows = await db
            .selectFrom('baseViews')
            .select('id')
            .where('pageId', '=', pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .forUpdate()
            .execute();
        return rows.map((r) => r.id);
    }
    async getLastPosition(pageId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        const result = await db
            .selectFrom('baseViews')
            .select('position')
            .where('pageId', '=', pageId)
            .where('workspaceId', '=', opts.workspaceId)
            .orderBy((0, kysely_1.sql) `position COLLATE "C"`, 'desc')
            .limit(1)
            .executeTakeFirst();
        return result?.position ?? null;
    }
    async insertView(view, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        return db
            .insertInto('baseViews')
            .values(view)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async updateView(viewId, data, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        await db
            .updateTable('baseViews')
            .set({ ...data, updatedAt: new Date() })
            .where('id', '=', viewId)
            .where('workspaceId', '=', opts.workspaceId)
            .execute();
    }
    async deleteView(viewId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts.trx);
        await db
            .deleteFrom('baseViews')
            .where('id', '=', viewId)
            .where('workspaceId', '=', opts.workspaceId)
            .execute();
    }
};
exports.BaseViewRepo = BaseViewRepo;
exports.BaseViewRepo = BaseViewRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], BaseViewRepo);
//# sourceMappingURL=base-view.repo.js.map