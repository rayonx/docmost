"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feature = void 0;
exports.getFeaturesForLicenseType = getFeaturesForLicenseType;
exports.getFeaturesForCloudPlan = getFeaturesForCloudPlan;
var features_1 = require("../../common/features");
Object.defineProperty(exports, "Feature", { enumerable: true, get: function () { return features_1.Feature; } });
const features_2 = require("../../common/features");
const BUSINESS_FEATURES = new Set([
    features_2.Feature.SSO_CUSTOM,
    features_2.Feature.SSO_GOOGLE,
    features_2.Feature.MFA,
    features_2.Feature.API_KEYS,
    features_2.Feature.COMMENT_RESOLUTION,
    features_2.Feature.PAGE_PERMISSIONS,
    features_2.Feature.AI,
    features_2.Feature.CONFLUENCE_IMPORT,
    features_2.Feature.DOCX_IMPORT,
    features_2.Feature.PDF_IMPORT,
    features_2.Feature.ATTACHMENT_INDEXING,
    features_2.Feature.SECURITY_SETTINGS,
    features_2.Feature.MCP,
    features_2.Feature.SHARING_CONTROLS,
    features_2.Feature.VIEWER_COMMENTS,
    features_2.Feature.TEMPLATES,
    features_2.Feature.PDF_EXPORT,
    features_2.Feature.PERSONAL_SPACES,
    features_2.Feature.DOCX_EXPORT,
    features_2.Feature.BASES,
]);
const ENTERPRISE_FEATURES = new Set([
    ...BUSINESS_FEATURES,
    features_2.Feature.SCIM,
    features_2.Feature.PAGE_VERIFICATION,
    features_2.Feature.AUDIT_LOGS,
    features_2.Feature.RETENTION,
]);
const CLOUD_STANDARD_FEATURES = new Set([
    features_2.Feature.AI,
    features_2.Feature.MCP,
    features_2.Feature.MFA,
    features_2.Feature.SSO_GOOGLE,
    features_2.Feature.PAGE_PERMISSIONS,
    features_2.Feature.COMMENT_RESOLUTION,
    features_2.Feature.CONFLUENCE_IMPORT,
    features_2.Feature.DOCX_IMPORT,
    features_2.Feature.PDF_IMPORT,
    features_2.Feature.API_KEYS,
    features_2.Feature.ATTACHMENT_INDEXING,
    features_2.Feature.SECURITY_SETTINGS,
    features_2.Feature.VIEWER_COMMENTS,
    features_2.Feature.TEMPLATES,
    features_2.Feature.PDF_EXPORT,
    features_2.Feature.PERSONAL_SPACES,
    features_2.Feature.DOCX_EXPORT,
    features_2.Feature.BASES,
]);
const CLOUD_BUSINESS_FEATURES = ENTERPRISE_FEATURES;
const EMPTY_FEATURES = new Set();
function getFeaturesForLicenseType(licenseType) {
    switch (licenseType) {
        case 'enterprise':
            return ENTERPRISE_FEATURES;
        case 'business':
            return BUSINESS_FEATURES;
        default:
            return EMPTY_FEATURES;
    }
}
function getFeaturesForCloudPlan(plan) {
    switch (plan) {
        case 'business':
            return CLOUD_BUSINESS_FEATURES;
        case 'standard':
            return CLOUD_STANDARD_FEATURES;
        default:
            return CLOUD_STANDARD_FEATURES;
    }
}
//# sourceMappingURL=feature-registry.js.map