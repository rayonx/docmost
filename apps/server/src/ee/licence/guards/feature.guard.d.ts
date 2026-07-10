import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { LicenseService } from "../license.service";
import { WorkspaceRepo } from "../../../database/repos/workspace/workspace.repo";
import { FeatureKey } from "../feature-registry";
export declare const REQUIRED_FEATURE_KEY = "requiredFeature";
export declare const RequireFeature: (feature: FeatureKey) => import("@nestjs/common").CustomDecorator<string>;
export declare class FeatureGuard implements CanActivate {
    private readonly reflector;
    private readonly environmentService;
    private readonly licenseService;
    private readonly workspaceRepo;
    constructor(reflector: Reflector, environmentService: EnvironmentService, licenseService: LicenseService, workspaceRepo: WorkspaceRepo);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
