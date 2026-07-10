import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ScimTokenService } from '../services/scim-token.service';
import { LicenseCheckService } from '../../../integrations/environment/license-check.service';
import { WorkspaceRepo } from "../../../database/repos/workspace/workspace.repo";
export declare class ScimAuthGuard implements CanActivate {
    private readonly scimTokenService;
    private readonly licenseCheckService;
    private readonly workspaceRepo;
    constructor(scimTokenService: ScimTokenService, licenseCheckService: LicenseCheckService, workspaceRepo: WorkspaceRepo);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
