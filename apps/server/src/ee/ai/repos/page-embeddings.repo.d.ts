import { InsertablePageEmbedding, PageEmbedding, UpdatablePageEmbedding } from "../../../database/types/entity.types";
import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
export declare class PageEmbeddingsRepo {
    private readonly db;
    constructor(db: KyselyDB);
    baseFields: Array<keyof PageEmbedding>;
    findByPageId(pageId: string, opts?: {
        includeEmbedding?: boolean;
        trx?: KyselyTransaction;
    }): Promise<PageEmbedding[]>;
    findById(id: string, opts?: {
        includeEmbedding?: boolean;
        trx?: KyselyTransaction;
    }): Promise<PageEmbedding[]>;
    insertPageEmbedding(embedding: InsertablePageEmbedding, trx?: KyselyTransaction): Promise<PageEmbedding>;
    insertPageEmbeddingBatch(embeddings: InsertablePageEmbedding[], opts: {
        trx?: KyselyTransaction;
    }): Promise<void>;
    updatePageEmbedding(updatablePageEmbedding: UpdatablePageEmbedding, pageId: string, trx?: KyselyTransaction): Promise<import("kysely").UpdateResult[]>;
    deleteByPageId(pageId: string, opts: {
        trx?: KyselyTransaction;
    }): Promise<void>;
    isPgVectorEnabled(): Promise<boolean>;
    isPageEmbeddingsTableExists(): Promise<boolean>;
    tableExists(tableName: string): Promise<boolean>;
}
