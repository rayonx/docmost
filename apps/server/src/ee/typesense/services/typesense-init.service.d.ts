import { OnApplicationBootstrap } from '@nestjs/common';
import { KyselyDB } from "../../../database/types/kysely.types";
import { TypesenseService } from './typesense.service';
import { PageSearchService } from './page-search.service';
export declare class TypesenseInitService implements OnApplicationBootstrap {
    private readonly db;
    private readonly typesenseService;
    private readonly pageSearchService;
    private readonly logger;
    constructor(db: KyselyDB, typesenseService: TypesenseService, pageSearchService: PageSearchService);
    onApplicationBootstrap(): Promise<void>;
    checkAndSync(): Promise<void>;
    private checkCollection;
    private checkLocale;
    private dropAndRecreate;
    private needsSync;
    private getDbCount;
    private getTypesenseCount;
    private createAndIndex;
}
