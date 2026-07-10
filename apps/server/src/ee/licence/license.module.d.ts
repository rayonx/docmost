import { OnApplicationBootstrap } from '@nestjs/common';
import { LicenseService } from './license.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';
export declare class LicenseModule implements OnApplicationBootstrap {
    private readonly environmentService;
    private readonly licenseService;
    private readonly logger;
    constructor(environmentService: EnvironmentService, licenseService: LicenseService);
    onApplicationBootstrap(): Promise<void>;
}
