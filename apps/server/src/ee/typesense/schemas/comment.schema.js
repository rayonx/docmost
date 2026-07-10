"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentSchema = void 0;
const constants_1 = require("../constants");
exports.commentSchema = {
    name: constants_1.CollectionSchema.COMMENT,
    fields: [
        {
            name: 'id',
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
            name: 'type',
            type: 'string',
            facet: true,
            optional: true,
        },
        {
            name: 'parentCommentId',
            type: 'string',
            facet: true,
            optional: true,
        },
        {
            name: 'pageId',
            type: 'string',
            facet: true,
        },
        {
            name: 'spaceId',
            type: 'string',
            facet: true,
        },
        {
            name: 'workspaceId',
            type: 'string',
            facet: true,
        },
        {
            name: 'creatorId',
            type: 'string',
            facet: true,
            optional: true,
        },
        {
            name: 'resolvedById',
            type: 'string',
            facet: true,
            optional: true,
        },
        {
            name: 'createdAt',
            type: 'int64',
            facet: false,
        },
        {
            name: 'resolvedAt',
            type: 'int64',
            facet: false,
            optional: true,
        },
        {
            name: 'editedAt',
            type: 'int64',
            facet: false,
            optional: true,
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
    default_sorting_field: 'createdAt',
};
//# sourceMappingURL=comment.schema.js.map