import { CanActivate } from '@nestjs/common';
import { EnvironmentService } from '../../integrations/environment/environment.service';
export declare class CloudAccessGuard implements CanActivate {
    private environmentService;
    constructor(environmentService: EnvironmentService);
    canActivate(): Promise<boolean>;
}
