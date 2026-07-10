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
exports.PageEmbeddingsRepo = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const kysely_1 = require("kysely");
const utils_1 = require("../../../database/utils");
let PageEmbeddingsRepo = class PageEmbeddingsRepo {
    constructor(db) {
        this.db = db;
        this.baseFields = [
            'id',
            'pageId',
            'embedding',
            'modelName',
            'modelDimensions',
            'chunkIndex',
            'chunkStart',
            'chunkLength',
            'metadata',
            'spaceId',
            'workspaceId',
            'createdAt',
            'updatedAt',
        ];
    }
    async findByPageId(pageId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        return await db
            .selectFrom('pageEmbeddings')
            .select(this.baseFields)
            .$if(opts?.includeEmbedding, (qb) => qb.select('embedding'))
            .where('pageId', '=', pageId)
            .orderBy('chunkIndex', 'asc')
            .execute();
    }
    async findById(id, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        return await db
            .selectFrom('pageEmbeddings')
            .select(this.baseFields)
            .$if(opts?.includeEmbedding, (qb) => qb.select('embedding'))
            .where('id', '=', id)
            .orderBy('chunkIndex', 'asc')
            .execute();
    }
    async insertPageEmbedding(embedding, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        return await db
            .insertInto('pageEmbeddings')
            .values({
            pageId: embedding.pageId,
            embedding: (0, kysely_1.sql) `${embedding.embedding}::halfvec`,
            chunkIndex: embedding.chunkIndex ?? 0,
            chunkStart: embedding.chunkStart ?? 0,
            chunkLength: embedding.chunkLength ?? 0,
            metadata: embedding.metadata ?? {},
            spaceId: embedding.spaceId,
            workspaceId: embedding.workspaceId,
        })
            .returning(this.baseFields)
            .executeTakeFirst();
    }
    async insertPageEmbeddingBatch(embeddings, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        if (embeddings.length === 0)
            return;
        const values = embeddings.map((e) => ({
            pageId: e.pageId,
            embedding: (0, kysely_1.sql) `${e.embedding}::halfvec`,
            modelName: e.modelName,
            modelDimensions: e.embedding.length,
            chunkIndex: e.chunkIndex ?? 0,
            chunkStart: e.chunkStart ?? 0,
            chunkLength: e.chunkLength ?? 0,
            metadata: e.metadata ?? {},
            spaceId: e.spaceId,
            workspaceId: e.workspaceId,
        }));
        await db.insertInto('pageEmbeddings').values(values).execute();
    }
    async updatePageEmbedding(updatablePageEmbedding, pageId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        return await db
            .updateTable('pageEmbeddings')
            .set({ ...updatablePageEmbedding, updatedAt: new Date() })
            .where('pageId', '=', pageId)
            .execute();
    }
    async deleteByPageId(pageId, opts) {
        const db = (0, utils_1.dbOrTx)(this.db, opts?.trx);
        await db
            .deleteFrom('pageEmbeddings')
            .where('pageId', '=', pageId)
            .execute();
    }
    async isPgVectorEnabled() {
        const result = await (0, kysely_1.sql) `
      SELECT EXISTS (
        SELECT 1 FROM pg_extension
        WHERE extname = 'vector'
      ) as exists
    `.execute(this.db);
        return result.rows[0]?.exists ?? false;
    }
    async isPageEmbeddingsTableExists() {
        return this.tableExists('page_embeddings');
    }
    async tableExists(tableName) {
        const result = await (0, kysely_1.sql) `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = COALESCE(current_schema(), 'public')
        AND table_name = ${tableName}
      ) as exists
    `.execute(this.db);
        return result.rows[0]?.exists ?? false;
    }
};
exports.PageEmbeddingsRepo = PageEmbeddingsRepo;
exports.PageEmbeddingsRepo = PageEmbeddingsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], PageEmbeddingsRepo);
//# sourceMappingURL=page-embeddings.repo.js.map