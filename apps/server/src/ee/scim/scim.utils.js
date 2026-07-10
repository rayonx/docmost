"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatScimUser = formatScimUser;
exports.hashScimToken = hashScimToken;
exports.generateRawScimToken = generateRawScimToken;
exports.throwScimError = throwScimError;
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
const scimmy_1 = require("scimmy");
const crypto_1 = require("crypto");
const nanoid_1 = require("nanoid");
function formatScimUser(data) {
    const { givenName, familyName, formatted } = data.name || {};
    const fallbackName = formatted || givenName || familyName || data.userName;
    const name = [givenName, familyName].filter(Boolean).join(' ').trim() || fallbackName;
    const email = data.userName;
    const isActive = data.active !== false;
    if (!email) {
        throw new scimmy_1.default.Types.Error(400, 'invalidValue', 'userName (email) is required.');
    }
    if (!(0, class_validator_1.isEmail)(email)) {
        throw new scimmy_1.default.Types.Error(400, 'invalidValue', 'The provided email address is not valid.');
    }
    return {
        name,
        email: email.toLowerCase(),
        active: isActive,
    };
}
const SCIM_TOKEN_PREFIX = 'dm_scim_';
const SCIM_TOKEN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const generateScimTokenSuffix = (0, nanoid_1.customAlphabet)(SCIM_TOKEN_ALPHABET, 32);
function hashScimToken(rawToken, appSecret) {
    return (0, crypto_1.createHmac)('sha256', appSecret).update(rawToken).digest('hex');
}
function generateRawScimToken() {
    return SCIM_TOKEN_PREFIX + generateScimTokenSuffix();
}
function throwScimError(status, detail, scimType) {
    throw new common_1.HttpException({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        status: String(status),
        scimType: scimType ?? null,
        detail,
    }, status);
}
//# sourceMappingURL=scim.utils.js.map