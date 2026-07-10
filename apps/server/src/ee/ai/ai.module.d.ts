import { OnApplicationBootstrap } from '@nestjs/common';
import { VectorProcessor } from './processors/vector.processor';
import { KyselyDB } from "../../database/types/kysely.types";
import { VectorService } from "./services/vector.service";
import { EnvironmentService } from '../../integrations/environment/environment.service';
export declare class AiModule implements OnApplicationBootstrap {
    private readonly db;
    private readonly vectorService;
    private readonly vectorProcessor;
    private readonly environmentService;
    private readonly logger;
    constructor(db: KyselyDB, vectorService: VectorService, vectorProcessor: VectorProcessor, environmentService: EnvironmentService);
    onApplicationBootstrap(): Promise<void>;
    vectorMigrations(): Promise<void>;
}
