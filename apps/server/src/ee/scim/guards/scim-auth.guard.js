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
exports.ScimAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const scim_token_service_1 = require("../services/scim-token.service");
const helpers_1 = require("../../../common/helpers");
const scim_utils_1 = require("../scim.utils");
const license_check_service_1 = require("../../../integrations/environment/license-check.service");
const feature_registry_1 = require("../../licence/feature-registry");
const workspace_repo_1 = require("../../../database/repos/workspace/workspace.repo");
let ScimAuthGuard = class ScimAuthGuard {
    constructor(scimTokenService, licenseCheckService, workspaceRepo) {
        this.scimTokenService = scimTokenService;
        this.licenseCheckService = licenseCheckService;
        this.workspaceRepo = workspaceRepo;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const workspace = request.raw?.workspace;
        if (!workspace) {
            (0, scim_utils_1.throwScimError)(401, 'Workspace not found');
        }
        let licenseKey = workspace.licenseKey;
        if (!licenseKey) {
            licenseKey = await this.workspaceRepo.findLicenseKeyById(workspace.id);
        }
        if (!this.licenseCheckService.hasFeature(licenseKey, feature_registry_1.Feature.SCIM, workspace.plan)) {
            (0, scim_utils_1.throwScimError)(403, 'SCIM provisioning requires the Enterprise plan.');
        }
        if (!workspace.isScimEnabled) {
            (0, scim_utils_1.throwScimError)(403, 'SCIM provisioning is not enabled for this workspace.');
        }
        const token = (0, helpers_1.extractBearerTokenFromHeader)(request);
        if (!token) {
            (0, scim_utils_1.throwScimError)(401, 'Invalid Authorization header. Expected: Bearer <token>');
        }
        await this.scimTokenService.validateBearerToken(token, workspace.id);
        return true;
    }
};
exports.ScimAuthGuard = ScimAuthGuard;
exports.ScimAuthGuard = ScimAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scim_token_service_1.ScimTokenService,
        license_check_service_1.LicenseCheckService,
        workspace_repo_1.WorkspaceRepo])
], ScimAuthGuard);
//# sourceMappingURL=scim-auth.guard.js.map