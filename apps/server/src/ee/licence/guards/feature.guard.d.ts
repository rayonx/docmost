import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { LicenseCheckService } from '../../../integrations/environment/license-check.service';
import { FeatureKey } from "../feature-registry";
export declare const REQUIRED_FEATURE_KEY = "requiredFeature";
export declare const RequireFeature: (feature: FeatureKey) => import("@nestjs/common").CustomDecorator<string>;
export declare class FeatureGuard implements CanActivate {
    private readonly reflector;
    private readonly environmentService;
    private readonly licenseCheckService;
    constructor(reflector: Reflector, environmentService: EnvironmentService, licenseCheckService: LicenseCheckService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
