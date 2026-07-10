"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformSearchResults = transformSearchResults;
exports.transformPageToDocument = transformPageToDocument;
exports.extractTypesenseError = extractTypesenseError;
function transformSearchResults(result, spaceMap) {
    return (result.hits?.map((hit) => {
        const doc = hit.document;
        const highlight = hit.highlights
            ?.find((h) => h.field === 'textContent')
            ?.snippet?.replace(/\r\n|\r|\n/g, ' ')
            .replace(/\s+/g, ' ');
        return {
            id: doc.id,
            slugId: doc.slugId,
            title: doc.title,
            icon: doc.icon,
            parentPageId: doc.parentPageId,
            creatorId: doc.creatorId,
            rank: hit.text_match,
            highlight: highlight || '',
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
            space: spaceMap?.get(doc.spaceId) || null,
        };
    }) ?? []);
}
function transformPageToDocument(page) {
    return {
        id: page.id,
        slugId: page.slugId,
        title: page.title,
        icon: page.icon,
        textContent: page.textContent
            ?.replace(/\n{2,}/g, '\n\n')
            .replace(/\s+/g, ' ')
            .trim(),
        workspaceId: page.workspaceId,
        spaceId: page.spaceId,
        creatorId: page.creatorId,
        contributorIds: page.contributorIds,
        parentPageId: page.parentPageId,
        createdAt: new Date(page.createdAt).getTime(),
        updatedAt: new Date(page.updatedAt).getTime(),
        deletedAt: page.deletedAt,
    };
}
function extractTypesenseError(error) {
    return error?.['errors']?.[0] || error;
}
//# sourceMappingURL=typesense.util.js.map