"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstObjectValue = void 0;
exports.generateRandomPassword = generateRandomPassword;
exports.safeRedirectPath = safeRedirectPath;
exports.getObjectFromKeys = getObjectFromKeys;
exports.formatSamlProfile = formatSamlProfile;
exports.formatOidcProfile = formatOidcProfile;
exports.diffSsoProvider = diffSsoProvider;
const crypto = require("node:crypto");
const constants_1 = require("./constants");
const helpers_1 = require("../../common/helpers");
function generateRandomPassword() {
    return crypto.randomBytes(16).toString('hex');
}
const REDIRECT_PATH_PLACEHOLDER_ORIGIN = 'https://docmost.local';
function safeRedirectPath(input) {
    if (typeof input !== 'string')
        return null;
    if (input.length === 0 || input.length > 2048)
        return null;
    if (/[\s\\]|\p{C}/u.test(input))
        return null;
    if (!input.startsWith('/') || input.startsWith('//'))
        return null;
    if (input.toLowerCase().includes('://'))
        return null;
    if (/^\/[a-z][a-z0-9+\-.]*:/i.test(input))
        return null;
    try {
        const resolved = new URL(input, REDIRECT_PATH_PLACEHOLDER_ORIGIN);
        if (resolved.origin !== REDIRECT_PATH_PLACEHOLDER_ORIGIN)
            return null;
        return resolved.pathname + resolved.search + resolved.hash;
    }
    catch {
        return null;
    }
}
function getObjectFromKeys(object, keys) {
    for (const key of keys) {
        const val = object?.[key];
        if (val != null) {
            return val;
        }
    }
    return undefined;
}
const getFirstObjectValue = (value) => {
    if (Array.isArray(value)) {
        return value.length > 0 ? value[0] : undefined;
    }
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    return trimmedValue || undefined;
};
exports.getFirstObjectValue = getFirstObjectValue;
function formatSamlProfile(profile, providerId) {
    const possibleEmailKeys = [
        'email',
        'emailaddress',
        'emailAddress',
        'EmailAddress',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/email',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailAddress',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/EmailAddress',
    ];
    const possibleFirstNameKeys = [
        'firstName',
        'firstname',
        'first_name',
        'FirstName',
        'givenName',
        'givenname',
        'given_name',
        'GivenName',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/firstName',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/firstname',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/first_name',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/FirstName',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenName',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/given_name',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/GivenName',
    ];
    const possibleLastNameKeys = [
        'lastName',
        'lastname',
        'last_name',
        'LastName',
        'surname',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/lastName',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/lastname',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/last_name',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/LastName',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    ];
    const possibleNameKeys = [
        'name',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
    ];
    const possibleGroupKeys = [
        'memberOf',
        'memberof',
        'groups',
        'Groups',
        'roles',
        'Roles',
        'http://schemas.xmlsoap.org/claims/Group',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role',
    ];
    const email = getObjectFromKeys(profile, possibleEmailKeys);
    const firstName = getObjectFromKeys(profile, possibleFirstNameKeys);
    const lastName = getObjectFromKeys(profile, possibleLastNameKeys);
    const name = getObjectFromKeys(profile, possibleNameKeys);
    let groups = [];
    const groupsData = getObjectFromKeys(profile, possibleGroupKeys);
    if (groupsData) {
        if (Array.isArray(groupsData)) {
            groups = groupsData;
        }
        else if (typeof groupsData === 'string') {
            groups = groupsData
                .split(/[,;]/)
                .map((g) => g.trim())
                .filter(Boolean);
        }
    }
    let fullName;
    if (firstName && lastName) {
        fullName = `${firstName} ${lastName}`.trim();
    }
    if (!fullName && firstName) {
        fullName = `${firstName}`;
    }
    if (!fullName && name) {
        fullName = name;
    }
    const issuer = profile?.issuer;
    return {
        nameId: profile.nameID?.toLowerCase(),
        name: fullName,
        email: email?.toLowerCase(),
        providerId: providerId,
        issuer: issuer,
        groups: groups,
    };
}
function formatOidcProfile(userInfo) {
    let sub = userInfo.sub ?? userInfo.id;
    if (!sub) {
        sub = userInfo.user_id;
    }
    const givenName = userInfo.given_name;
    const familyName = userInfo.family_name;
    let name = userInfo.name;
    if (!name && givenName && familyName) {
        name = `${givenName} ${familyName}`.trim();
    }
    if (!name && givenName) {
        name = `${givenName}`;
    }
    if (!name) {
        name = userInfo.preferred_username;
    }
    let groups = [];
    const groupsClaim = userInfo.groups || userInfo.roles;
    if (groupsClaim) {
        if (Array.isArray(groupsClaim)) {
            groups = groupsClaim.filter((g) => typeof g === 'string');
        }
        else if (typeof groupsClaim === 'string') {
            groups = groupsClaim
                .split(/[,;]/)
                .map((g) => g.trim())
                .filter(Boolean);
        }
    }
    return {
        sub: sub,
        name: name,
        email: userInfo.email?.toLowerCase(),
        type: constants_1.SSO_PROVIDER.OIDC,
        groups: groups,
    };
}
const SSO_AUDIT_TRACKED_FIELDS = [
    'name',
    'isEnabled',
    'groupSync',
    'allowSignup',
    'samlUrl',
    'oidcIssuer',
    'oidcClientId',
    'ldapUrl',
    'ldapBindDn',
    'ldapBaseDn',
    'ldapUserSearchFilter',
    'ldapUserAttributes',
    'ldapTlsEnabled',
];
const SSO_AUDIT_SENSITIVE_FIELDS = [
    'samlCertificate',
    'oidcClientSecret',
    'ldapBindPassword',
    'ldapTlsCaCert',
];
function diffSsoProvider(dto, providerBefore, providerAfter) {
    const changes = (0, helpers_1.diffAuditTrackedFields)(SSO_AUDIT_TRACKED_FIELDS, dto, providerBefore, providerAfter);
    const before = changes?.before ?? {};
    const after = changes?.after ?? {};
    for (const field of SSO_AUDIT_SENSITIVE_FIELDS) {
        if (typeof dto[field] === 'undefined')
            continue;
        const oldVal = providerBefore[field] ?? null;
        const newVal = providerAfter[field] ?? null;
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            before[field] = oldVal ? '******' : null;
            after[field] = newVal ? '******' : null;
        }
    }
    return Object.keys(after).length > 0 ? { before, after } : null;
}
//# sourceMappingURL=sso.utils.js.map