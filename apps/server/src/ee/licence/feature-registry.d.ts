export { Feature, type FeatureKey } from '../../common/features';
import { type FeatureKey } from '../../common/features';
export declare function getFeaturesForLicenseType(licenseType: string | undefined): ReadonlySet<FeatureKey>;
export declare function getFeaturesForCloudPlan(plan: string | undefined): ReadonlySet<FeatureKey>;
