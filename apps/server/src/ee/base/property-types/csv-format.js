"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveChoiceName = resolveChoiceName;
exports.resolveUser = resolveUser;
exports.neutralizeCsvFormula = neutralizeCsvFormula;
function resolveChoiceName(typeOptions, id) {
    if (!typeOptions || typeof typeOptions !== 'object')
        return '';
    const choices = typeOptions.choices;
    if (!Array.isArray(choices))
        return '';
    const match = choices.find((c) => c?.id === String(id));
    return typeof match?.name === 'string' ? match.name : '';
}
function resolveUser(id, ctx) {
    if (typeof id !== 'string')
        return '';
    return ctx.userNames?.get(id) ?? '';
}
function neutralizeCsvFormula(s) {
    return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}
//# sourceMappingURL=csv-format.js.map