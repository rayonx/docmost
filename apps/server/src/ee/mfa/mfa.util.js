"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaMethod = void 0;
exports.hashBackupCodes = hashBackupCodes;
exports.generateMfaSecret = generateMfaSecret;
exports.encryptSecret = encryptSecret;
exports.decryptSecret = decryptSecret;
exports.generateBackupCodes = generateBackupCodes;
exports.resolveMfaEnablement = resolveMfaEnablement;
const crypto = require("crypto");
const helpers_1 = require("../../common/helpers");
const OTPAuth = require("otpauth");
const bcrypt = require("bcrypt");
var MfaMethod;
(function (MfaMethod) {
    MfaMethod["TOTP"] = "totp";
})(MfaMethod || (exports.MfaMethod = MfaMethod = {}));
async function hashBackupCodes(codes) {
    return await Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
}
function generateMfaSecret() {
    const buffer = crypto.randomBytes(20);
    return OTPAuth.Secret.fromHex(buffer.toString('hex')).base32;
}
function encryptSecret(opts) {
    const { mfaSecret, appSecret } = opts;
    const algorithm = 'aes-256-gcm';
    const key = deriveEncryptionKey(appSecret);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(mfaSecret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}
function decryptSecret(opts) {
    const { mfaSecret, appSecret } = opts;
    const algorithm = 'aes-256-gcm';
    const key = deriveEncryptionKey(appSecret);
    const parts = mfaSecret.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
function generateBackupCodes(count = 5) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = (0, helpers_1.nanoIdGen)(8).toUpperCase();
        codes.push(code);
    }
    return codes;
}
function deriveEncryptionKey(appSecret) {
    return crypto.createHash('sha256').update(appSecret).digest();
}
function resolveMfaEnablement(existingMfa) {
    if (!existingMfa || !existingMfa.secret) {
        return { canEnable: false, reason: 'setup_not_initiated' };
    }
    if (existingMfa.isEnabled) {
        return { canEnable: false, reason: 'already_enabled' };
    }
    return { canEnable: true, secret: existingMfa.secret };
}
//# sourceMappingURL=mfa.util.js.map