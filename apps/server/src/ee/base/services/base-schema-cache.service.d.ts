import { BaseProperty } from "../../../database/types/entity.types";
import { BasePropertyRepo } from "../repos/base-property.repo";
export declare class BaseSchemaCacheService {
    private readonly basePropertyRepo;
    private readonly cache;
    private maxEntries;
    constructor(basePropertyRepo: BasePropertyRepo);
    getProperties(pageId: string, schemaVersion: number): Promise<BaseProperty[]>;
}
