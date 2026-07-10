"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
const kysely_1 = require("kysely");
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger();
async function up(db) {
    const extensionCheck = await (0, kysely_1.sql) `
    SELECT EXISTS (
      SELECT 1 FROM pg_available_extensions 
      WHERE name = 'vector'
    ) as available
  `.execute(db);
    if (!extensionCheck.rows[0]?.available) {
        logger.warn('Postgres pgvector extension is not available. Skipping embeddings table creation.');
        logger.log('To enable AI vector search, install the pgvector Postgres extension : https://github.com/pgvector/pgvector');
        return;
    }
    await (0, kysely_1.sql) `CREATE EXTENSION IF NOT EXISTS vector`.execute(db);
    await db.schema
        .createTable('page_embeddings')
        .ifNotExists()
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_uuid_v7()`))
        .addColumn('page_id', 'uuid', (col) => col.notNull())
        .addColumn('embedding', (0, kysely_1.sql) `halfvec`, (col) => col.notNull())
        .addColumn('model_name', 'text', (col) => col)
        .addColumn('model_dimensions', 'int8', (col) => col)
        .addColumn('chunk_text', 'text', (col) => col)
        .addColumn('chunk_index', 'int8', (col) => col)
        .addColumn('chunk_start', 'int8', (col) => col)
        .addColumn('chunk_length', 'int8', (col) => col)
        .addColumn('metadata', 'jsonb', (col) => col.defaultTo((0, kysely_1.sql) `'{}'::jsonb`))
        .addColumn('space_id', 'uuid', (col) => col.notNull())
        .addColumn('workspace_id', 'uuid', (col) => col.notNull())
        .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo((0, kysely_1.sql) `now()`))
        .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .addColumn('deleted_at', 'timestamptz', (col) => col)
        .execute();
    await db.schema
        .createIndex('page_embeddings_page_id_idx')
        .ifNotExists()
        .on('page_embeddings')
        .column('page_id')
        .execute();
    await db.schema
        .createIndex('page_embeddings_space_id_idx')
        .ifNotExists()
        .on('page_embeddings')
        .column('space_id')
        .execute();
}
//# sourceMappingURL=20250818T210445-page_embeddings.js.map