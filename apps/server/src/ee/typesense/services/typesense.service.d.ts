import { EnvironmentService } from '../../../integrations/environment/environment.service';
import * as Typesense from 'typesense';
export declare class TypesenseService {
    private readonly environmentService;
    private readonly logger;
    private readonly typesenseClient;
    constructor(environmentService: EnvironmentService);
    getClient(): Typesense.Client;
    isTypesenseEnabled(): boolean;
    createCollections(): Promise<void>;
}
