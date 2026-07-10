import { OnModuleDestroy } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiSearchService } from '../services/ai-search.service';
import { VectorSyncService } from "../services/vector-sync.service";
import { PageEmbeddingsRepo } from "../repos/page-embeddings.repo";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
export declare class VectorProcessor extends WorkerHost implements OnModuleDestroy {
    private readonly aiSearchService;
    private readonly vectorSyncService;
    private readonly pageEmbeddingsRepo;
    private readonly environmentService;
    private readonly logger;
    constructor(aiSearchService: AiSearchService, vectorSyncService: VectorSyncService, pageEmbeddingsRepo: PageEmbeddingsRepo, environmentService: EnvironmentService);
    process(job: Job<any, void>): Promise<void>;
    onActive(job: Job): void;
    onError(job: Job): void;
    onCompleted(job: Job): void;
    onModuleDestroy(): Promise<void>;
}
