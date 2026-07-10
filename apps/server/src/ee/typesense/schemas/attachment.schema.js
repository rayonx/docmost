"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentSchema = void 0;
const constants_1 = require("../constants");
exports.attachmentSchema = {
    name: constants_1.CollectionSchema.ATTACHMENT,
    fields: [
        {
            name: 'id',
            type: 'string',
            facet: false,
        },
        {
            name: 'fileName',
            type: 'string',
            facet: false,
        },
        {
            name: 'textContent',
            type: 'string',
            facet: false,
            optional: true,
        },
        {
            name: 'workspaceId',
            type: 'string',
            facet: true,
        },
        {
            name: 'spaceId',
            type: 'string',
            facet: true,
            optional: true,
        },
        {
            name: 'pageId',
            type: 'string',
            facet: true,
            optional: true,
            reference: 'pages.id',
        },
        {
            name: 'creatorId',
            type: 'string',
            facet: true,
        },
        {
            name: 'fileExt',
            type: 'string',
            facet: true,
        },
        {
            name: 'mimeType',
            type: 'string',
            facet: true,
            optional: true,
        },
        {
            name: 'fileSize',
            type: 'int64',
            facet: false,
            optional: true,
        },
        {
            name: 'createdAt',
            type: 'int64',
            facet: false,
        },
        {
            name: 'updatedAt',
            type: 'int64',
            facet: false,
        },
        {
            name: 'deletedAt',
            type: 'int64',
            facet: false,
            optional: true,
        },
    ],
    token_separators: ['_', '-', '.'],
    default_sorting_field: 'createdAt',
};
//# sourceMappingURL=attachment.schema.js.map