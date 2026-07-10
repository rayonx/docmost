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
exports.BasePropertyRepo = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const utils_1 = require("../../../database/utils");
const kysely_1 = require("kysely");
const nanoid_utils_1 = require("../../../common/helpers/nanoid.utils");
let BasePropertyRepo = class BasePropertyRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(pageId, propertyId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        let qb = db
            .selectFrom('baseProperties')
            .selectAll()
            .where('pageId', '=', pageId)
            .where('id', '=', propertyId);
        if (!opts?.includeDeleted)
            qb = qb.where('deletedAt', 'is', null);
        return qb.executeTakeFirst();
    }
    async findByPageId(pageId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        return db
            .selectFrom('baseProperties')
            .selectAll()
            .where('pageId', '=', pageId)
            .where('deletedAt', 'is', null)
            .orderBy((0, kysely_1.sql) `position COLLATE "C"`, 'asc')
            .execute();
    }
    async getLastPosition(pageId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        const result = await db
            .selectFrom('baseProperties')
            .select('position')
            .where('pageId', '=', pageId)
            .orderBy((0, kysely_1.sql) `position COLLATE "C"`, 'desc')
            .limit(1)
            .executeTakeFirst();
        return result?.position ?? null;
    }
    async insertProperty(property, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        return db
            .insertInto('baseProperties')
            .values({ ...property, id: property.id ?? (0, nanoid_utils_1.generateBasePropertyId)() })
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async updateProperty(pageId, propertyId, data, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        await db
            .updateTable('baseProperties')
            .set({ ...data, updatedAt: new Date() })
            .where('pageId', '=', pageId)
            .where('id', '=', propertyId)
            .execute();
    }
    async softDelete(pageId, propertyId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        await db
            .updateTable('baseProperties')
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where('pageId', '=', pageId)
            .where('id', '=', propertyId)
            .execute();
    }
    async hardDelete(pageId, propertyId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        await db
            .deleteFrom('baseProperties')
            .where('pageId', '=', pageId)
            .where('id', '=', propertyId)
            .execute();
    }
    async bumpSchemaVersion(pageId, propertyId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        await db
            .updateTable('baseProperties')
            .set({
            schemaVersion: (0, kysely_1.sql) `schema_version + 1`,
            updatedAt: new Date(),
        })
            .where('pageId', '=', pageId)
            .where('id', '=', propertyId)
            .execute();
    }
    async commitPendingTypeChange(pageId, propertyId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        await db
            .updateTable('baseProperties')
            .set({
            type: (0, kysely_1.sql) `coalesce(pending_type, type)`,
            typeOptions: (0, kysely_1.sql) `coalesce(pending_type_options, type_options)`,
            pendingType: null,
            pendingTypeOptions: null,
            pendingToken: null,
            updatedAt: new Date(),
        })
            .where('pageId', '=', pageId)
            .where('id', '=', propertyId)
            .execute();
    }
    async clearPendingTypeChange(pageId, propertyId, expectedPendingToken, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        let qb = db
            .updateTable('baseProperties')
            .set({
            pendingType: null,
            pendingTypeOptions: null,
            pendingToken: null,
            updatedAt: new Date(),
        })
            .where('pageId', '=', pageId)
            .where('id', '=', propertyId);
        if (expectedPendingToken !== undefined) {
            qb = qb.where('pendingToken', '=', expectedPendingToken);
        }
        await qb.execute();
    }
};
exports.BasePropertyRepo = BasePropertyRepo;
exports.BasePropertyRepo = BasePropertyRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], BasePropertyRepo);
//# sourceMappingURL=base-property.repo.js.map