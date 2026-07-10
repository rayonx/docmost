import { EnvironmentService } from '../../integrations/environment/environment.service';
export declare class GotenbergClient {
    private readonly environmentService;
    private readonly logger;
    constructor(environmentService: EnvironmentService);
    convertUrlToPdf(url: string): Promise<Buffer>;
}
