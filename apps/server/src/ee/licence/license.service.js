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
var LicenseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const license_constant_1 = require("./license.constant");
const date_fns_1 = require("date-fns");
const feature_registry_1 = require("./feature-registry");
const workspace_repo_1 = require("../../database/repos/workspace/workspace.repo");
let LicenseService = LicenseService_1 = class LicenseService {
    constructor(workspaceRepo) {
        this.workspaceRepo = workspaceRepo;
        this.logger = new common_1.Logger(LicenseService_1.name);
    }
    async activateLicense(licenseKey, workspaceId) {
        const license = this.verifyLicense(licenseKey);
        if (!license) {
            throw new common_1.BadRequestException('Invalid license key.');
        }
        if (this.isLicenseExpired(license)) {
            throw new common_1.BadRequestException('Your license has expired.');
        }
        const workspaceUserCount = await this.workspaceRepo.getActiveUserCount(workspaceId);
        if (workspaceUserCount > license.seats) {
            throw new common_1.BadRequestException('Workspace user count is greater than licensed seats.');
        }
        if (license?.['workspaceId'] && license?.['workspaceId'] !== workspaceId) {
            throw new common_1.BadRequestException('License not valid for this workspace.');
        }
        await this.workspaceRepo.updateWorkspace({
            licenseKey: licenseKey,
        }, workspaceId);
        return this.formatLicense(license);
    }
    async removeLicense(workspaceId) {
        await this.workspaceRepo.updateWorkspace({
            licenseKey: null,
        }, workspaceId);
    }
    isValidEELicense(licenseKey) {
        if (!licenseKey)
            return false;
        const license = this.verifyLicense(licenseKey);
        if (!license)
            return false;
        if (this.isLicenseExpired(license)) {
            this.logger.error('Enterprise license has expired.');
            return false;
        }
        return true;
    }
    hasFeature(licenseKey, feature) {
        if (!licenseKey)
            return false;
        const license = this.verifyLicense(licenseKey);
        if (!license)
            return false;
        if (this.isLicenseExpired(license))
            return false;
        const licenseType = license.licenseType ?? 'enterprise';
        return (0, feature_registry_1.getFeaturesForLicenseType)(licenseType).has(feature);
    }
    getFeatures(licenseKey) {
        if (!licenseKey)
            return [];
        const license = this.verifyLicense(licenseKey);
        if (!license)
            return [];
        if (this.isLicenseExpired(license))
            return [];
        const licenseType = license.licenseType ?? 'enterprise';
        return [...(0, feature_registry_1.getFeaturesForLicenseType)(licenseType)];
    }
    getLicenseType(licenseKey) {
        if (!licenseKey)
            return null;
        const license = this.verifyLicense(licenseKey);
        if (!license)
            return null;
        if (this.isLicenseExpired(license))
            return null;
        return license.licenseType ?? 'enterprise';
    }
    async getLicenseInfo(licenseKey) {
        if (!licenseKey) {
            throw new common_1.BadRequestException('No license key found.');
        }
        const license = this.verifyLicense(licenseKey);
        if (!license) {
            throw new common_1.BadRequestException('You do not have a valid enterprise license key');
        }
        return this.formatLicense(license);
    }
    verifyLicense(licenseKey) {
        try {
            return jwt.verify(licenseKey, license_constant_1.ENTERPRISE_LICENSE_PUBLIC_KEY, {
                algorithms: ['RS256'],
                ignoreExpiration: true,
            });
        }
        catch (err) {
            this.logger.error({ err }, 'Failed to verify enterprise license');
            return null;
        }
    }
    isLicenseExpired(license) {
        const expiryDate = new Date(license.expiresAt);
        const now = new Date();
        if (now > expiryDate) {
            const gracePeriodDays = license.trial ? 10 : 30;
            return now > (0, date_fns_1.addDays)(expiryDate, gracePeriodDays);
        }
        return false;
    }
    formatLicense(license) {
        return {
            id: license.licenseId,
            customerName: license.customer.name,
            seatCount: license.seats,
            licenseType: license.licenseType ?? 'enterprise',
            issuedAt: license.issuedAt,
            expiresAt: license.expiresAt,
            trial: license.trial,
        };
    }
};
exports.LicenseService = LicenseService;
exports.LicenseService = LicenseService = LicenseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspace_repo_1.WorkspaceRepo])
], LicenseService);
//# sourceMappingURL=license.service.js.map