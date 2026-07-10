import { LicenseInfo, LicensePayload, LicenseType } from "./license.interface";
import { FeatureKey } from "./feature-registry";
import { WorkspaceRepo } from "../../database/repos/workspace/workspace.repo";
export declare class LicenseService {
    private readonly workspaceRepo;
    private readonly logger;
    constructor(workspaceRepo: WorkspaceRepo);
    activateLicense(licenseKey: string, workspaceId: string): Promise<LicenseInfo>;
    removeLicense(workspaceId: string): Promise<void>;
    isValidEELicense(licenseKey: string): boolean;
    hasFeature(licenseKey: string, feature: FeatureKey): boolean;
    getFeatures(licenseKey: string): FeatureKey[];
    getLicenseType(licenseKey: string): LicenseType | null;
    getLicenseInfo(licenseKey: string): Promise<LicenseInfo>;
    private verifyLicense;
    isLicenseExpired(license: LicensePayload): boolean;
    formatLicense(license: LicensePayload): LicenseInfo;
}
