import { KyselyDB } from "../../../database/types/kysely.types";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { PageEmbeddingsRepo } from "../repos/page-embeddings.repo";
import { Queue } from 'bullmq';
export declare class VectorService {
    private readonly db;
    private readonly environmentService;
    private readonly pageEmbeddingsRepo;
    private readonly aiQueue;
    private readonly logger;
    constructor(db: KyselyDB, environmentService: EnvironmentService, pageEmbeddingsRepo: PageEmbeddingsRepo, aiQueue: Queue);
    validateEmbeddings(): Promise<void>;
    private checkModelMismatch;
    private createIndexIfNotExists;
    private resetEmbeddings;
}
