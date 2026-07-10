"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGuard = exports.RequireFeature = exports.REQUIRED_FEATURE_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const license_service_1 = require("../license.service");
const workspace_repo_1 = require("../../../database/repos/workspace/workspace.repo");
const feature_registry_1 = require("../feature-registry");
exports.REQUIRED_FEATURE_KEY = 'requiredFeature';
const RequireFeature = (feature) => (0, common_1.SetMetadata)(exports.REQUIRED_FEATURE_KEY, feature);
exports.RequireFeature = RequireFeature;
let FeatureGuard = class FeatureGuard {
    constructor(reflector, environmentService, licenseService, workspaceRepo) {
        this.reflector = reflector;
        this.environmentService = environmentService;
        this.licenseService = licenseService;
        this.workspaceRepo = workspaceRepo;
    }
    async canActivate(context) {
        const requiredFeature = this.reflector.getAllAndOverride(exports.REQUIRED_FEATURE_KEY, [context.getHandler(), context.getClass()]);
        const request = context.switchToHttp().getRequest();
        if (this.environmentService.isCloud()) {
            if (!requiredFeature)
                return true;
            const workspace = request.raw?.workspace;
            const features = (0, feature_registry_1.getFeaturesForCloudPlan)(workspace?.plan);
            if (!features.has(requiredFeature)) {
                throw new common_1.ForbiddenException('Please upgrade your plan to use this feature.');
            }
            return true;
        }
        let licenseKey = request.raw?.workspace?.licenseKey;
        if (!licenseKey) {
            const workspaceId = request?.user?.workspace?.id;
            if (workspaceId) {
                licenseKey = await this.workspaceRepo.findLicenseKeyById(workspaceId);
            }
        }
        if (!requiredFeature) {
            if (this.licenseService.isValidEELicense(licenseKey)) {
                return true;
            }
            throw new common_1.ForbiddenException('This feature requires a valid license.');
        }
        if (this.licenseService.hasFeature(licenseKey, requiredFeature)) {
            return true;
        }
        if (this.licenseService.isValidEELicense(licenseKey)) {
            throw new common_1.ForbiddenException('This feature requires a higher-tier license.');
        }
        throw new common_1.ForbiddenException('This feature requires a valid license.');
    }
};
exports.FeatureGuard = FeatureGuard;
exports.FeatureGuard = FeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        environment_service_1.EnvironmentService,
        license_service_1.LicenseService,
        workspace_repo_1.WorkspaceRepo])
], FeatureGuard);
//# sourceMappingURL=feature.guard.js.map