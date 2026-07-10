"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.derivePersonalSpaceName = derivePersonalSpaceName;
exports.sanitizeSlugBase = sanitizeSlugBase;
function derivePersonalSpaceName(user) {
    const firstWord = (user.name ?? '').trim().split(/\s+/).filter(Boolean)[0];
    const emailLocal = (user.email ?? '').split('@')[0];
    const base = firstWord || emailLocal || 'Personal';
    return `${base}'s space`;
}
function sanitizeSlugBase(name) {
    return (name ?? '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()
        .slice(0, 40);
}
//# sourceMappingURL=personal-space.util.js.map