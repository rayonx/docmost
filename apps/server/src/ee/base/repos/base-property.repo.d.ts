import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
import { BaseProperty, InsertableBaseProperty, UpdatableBaseProperty } from "../../../database/types/entity.types";
export declare class BasePropertyRepo {
    private readonly db;
    constructor(db: KyselyDB);
    findById(pageId: string, propertyId: string, opts?: {
        trx?: KyselyTransaction;
        includeDeleted?: boolean;
    }): Promise<BaseProperty | undefined>;
    findByPageId(pageId: string, opts?: {
        trx?: KyselyTransaction;
    }): Promise<BaseProperty[]>;
    getLastPosition(pageId: string, trx?: KyselyTransaction): Promise<string | null>;
    insertProperty(property: Omit<InsertableBaseProperty, 'id'> & {
        id?: string;
    }, trx?: KyselyTransaction): Promise<BaseProperty>;
    updateProperty(pageId: string, propertyId: string, data: UpdatableBaseProperty, trx?: KyselyTransaction): Promise<void>;
    softDelete(pageId: string, propertyId: string, trx?: KyselyTransaction): Promise<void>;
    hardDelete(pageId: string, propertyId: string, trx?: KyselyTransaction): Promise<void>;
    bumpSchemaVersion(pageId: string, propertyId: string, trx?: KyselyTransaction): Promise<void>;
    commitPendingTypeChange(pageId: string, propertyId: string, trx?: KyselyTransaction): Promise<void>;
    clearPendingTypeChange(pageId: string, propertyId: string, expectedPendingToken?: string, trx?: KyselyTransaction): Promise<void>;
}
