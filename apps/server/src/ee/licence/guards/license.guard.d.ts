import { CanActivate, ExecutionContext } from '@nestjs/common';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { LicenseService } from "../license.service";
import { WorkspaceRepo } from "../../../database/repos/workspace/workspace.repo";
export declare class LicenseGuard implements CanActivate {
    private environmentService;
    private readonly licenseService;
    private readonly workspaceRepo;
    constructor(environmentService: EnvironmentService, licenseService: LicenseService, workspaceRepo: WorkspaceRepo);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
