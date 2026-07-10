"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_REFERENCE_SOURCES = void 0;
exports.referenceSource = referenceSource;
exports.resolveReferenceDisplay = resolveReferenceDisplay;
const personSource = {
    kind: 'person',
    extractIds: (cell) => Array.isArray(cell)
        ? cell.filter((v) => typeof v === 'string')
        : typeof cell === 'string'
            ? [cell]
            : [],
    resolveDisplay: (cell, ctx) => personSource
        .extractIds(cell)
        .map((id) => ctx.userNames?.get(String(id)))
        .filter((v) => typeof v === 'string' && v.length > 0),
    contextNeed: 'users',
};
const pageSource = {
    kind: 'page',
    extractIds: (cell) => (typeof cell === 'string' && cell.length > 0 ? [cell] : []),
    resolveDisplay: (cell, ctx) => {
        if (typeof cell !== 'string' || cell.length === 0)
            return [];
        const title = ctx.pageTitles?.get(cell);
        return typeof title === 'string' && title.length > 0 ? [title] : [];
    },
    contextNeed: 'pages',
};
const fileSource = {
    kind: 'file',
    extractIds: (cell) => Array.isArray(cell)
        ? cell
            .map((f) => f && typeof f === 'object' && typeof f.id === 'string'
            ? f.id
            : typeof f === 'string'
                ? f
                : undefined)
            .filter((v) => typeof v === 'string')
        : [],
    resolveDisplay: (cell, ctx) => Array.isArray(cell)
        ? cell
            .map((f) => {
            if (f && typeof f === 'object') {
                if (typeof f.fileName === 'string')
                    return f.fileName;
                if (typeof f.id === 'string')
                    return ctx.attachmentNames?.get(f.id);
            }
            if (typeof f === 'string')
                return ctx.attachmentNames?.get(f);
            return undefined;
        })
            .filter((v) => typeof v === 'string' && v.length > 0)
        : [],
    contextNeed: 'attachments',
};
exports.SERVER_REFERENCE_SOURCES = {
    person: personSource,
    page: pageSource,
    file: fileSource,
};
function referenceSource(kind) {
    return exports.SERVER_REFERENCE_SOURCES[kind];
}
function resolveReferenceDisplay(kind, cell, ctx) {
    return referenceSource(kind)?.resolveDisplay(cell, ctx) ?? [];
}
//# sourceMappingURL=reference-source.js.map