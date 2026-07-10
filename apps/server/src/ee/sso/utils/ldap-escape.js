"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeFilter = escapeFilter;
exports.escapeDn = escapeDn;
const replacements = {
    filter: {
        '\u0000': '\\00',
        '\u0028': '\\28',
        '\u0029': '\\29',
        '\u002a': '\\2a',
        '\u005c': '\\5c'
    },
    dnBegin: {
        '\u0020': '\\ ',
    },
    dn: {
        '\u0022': '\\"',
        '\u0023': '\\#',
        '\u002b': '\\+',
        '\u002c': '\\,',
        '\u003b': '\\;',
        '\u003c': '\\<',
        '\u003d': '\\=',
        '\u003e': '\\>',
        '\u005c': '\\\\'
    },
    dnEnd: {
        '\u0020': '\\ '
    }
};
function escapeFilter(value) {
    return value.replace(/(\u0000|\u0028|\u0029|\u002a|\u005c)/gm, (ch) => replacements.filter[ch]);
}
function escapeDn(value) {
    return value
        .replace(/(\u0022|\u0023|\u002b|\u002c|\u003b|\u003c|\u003d|\u003e|\u005c)/gm, (ch) => replacements.dn[ch])
        .replace(/^(\u0020)/gm, (ch) => replacements.dnBegin[ch])
        .replace(/(\u0020)$/gm, (ch) => replacements.dnEnd[ch]);
}
//# sourceMappingURL=ldap-escape.js.map