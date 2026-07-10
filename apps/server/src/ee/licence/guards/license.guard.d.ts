import { CanActivate, ExecutionContext } from '@nestjs/common';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { LicenseCheckService } from '../../../integrations/environment/license-check.service';
export declare class LicenseGuard implements CanActivate {
    private environmentService;
    private readonly licenseCheckService;
    constructor(environmentService: EnvironmentService, licenseCheckService: LicenseCheckService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
