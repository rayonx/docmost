import { OnModuleDestroy } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TypesenseInitService } from "../services/typesense-init.service";
import { TypesenseSyncService } from '../services/typesense-sync.service';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
export declare class SearchProcessor extends WorkerHost implements OnModuleDestroy {
    private readonly typesenseHealthService;
    private readonly typesenseSyncService;
    private readonly environmentService;
    private readonly logger;
    constructor(typesenseHealthService: TypesenseInitService, typesenseSyncService: TypesenseSyncService, environmentService: EnvironmentService);
    process(job: Job<any, void>): Promise<void>;
    onActive(job: Job): void;
    onError(job: Job): void;
    onCompleted(job: Job): void;
    onModuleDestroy(): Promise<void>;
}
