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
exports.LicenseGuard = void 0;
const common_1 = require("@nestjs/common");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const license_service_1 = require("../license.service");
const workspace_repo_1 = require("../../../database/repos/workspace/workspace.repo");
let LicenseGuard = class LicenseGuard {
    constructor(environmentService, licenseService, workspaceRepo) {
        this.environmentService = environmentService;
        this.licenseService = licenseService;
        this.workspaceRepo = workspaceRepo;
    }
    async canActivate(context) {
        if (this.environmentService.isCloud()) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        let licenseKey = request.raw?.workspace?.licenseKey;
        if (!licenseKey) {
            const workspaceId = request?.user?.workspace?.id;
            if (workspaceId) {
                licenseKey = await this.workspaceRepo.findLicenseKeyById(workspaceId);
            }
        }
        if (this.licenseService.isValidEELicense(licenseKey)) {
            return true;
        }
        else {
            throw new common_1.ForbiddenException('This endpoint requires a valid enterprise license.');
        }
    }
};
exports.LicenseGuard = LicenseGuard;
exports.LicenseGuard = LicenseGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService,
        license_service_1.LicenseService,
        workspace_repo_1.WorkspaceRepo])
], LicenseGuard);
//# sourceMappingURL=license.guard.js.map