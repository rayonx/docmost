import { KyselyDB } from "../../../database/types/kysely.types";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { Queue } from 'bullmq';
import { AiService } from './ai.service';
export declare class VectorSyncService {
    private readonly db;
    private readonly environmentService;
    private readonly aiQueue;
    private readonly aiService;
    private readonly logger;
    constructor(db: KyselyDB, environmentService: EnvironmentService, aiQueue: Queue, aiService: AiService);
    handlePageEmbeds(pageIds: string[], workspaceId: string): Promise<void>;
    handlePageMovedToSpace(pageIds: string[]): Promise<void>;
    handlePageDeletion(pageIds: string[]): Promise<void>;
    handleSpaceDeletion(spaceId: string): Promise<void>;
    handleCreateEmbeddingsForWorkspace(data: {
        workspaceId: string | null;
        global?: boolean;
    }): Promise<void>;
    handleDeleteEmbeddingsForWorkspace(workspaceId: string): Promise<void>;
    private queuePagesForEmbedding;
}
