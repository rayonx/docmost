"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageSchema = void 0;
const constants_1 = require("../constants");
exports.pageSchema = {
    name: constants_1.CollectionSchema.PAGE,
    fields: [
        {
            name: 'id',
            type: 'string',
            facet: false,
        },
        {
            name: 'slugId',
            type: 'string',
            facet: false,
        },
        {
            name: 'title',
            type: 'string',
            facet: false,
            optional: true,
            locale: constants_1.TYPESENSE_LOCALE,
        },
        {
            name: 'icon',
            type: 'string',
            facet: false,
            optional: true,
        },
        {
            name: 'textContent',
            type: 'string',
            facet: false,
            optional: true,
            locale: constants_1.TYPESENSE_LOCALE,
        },
        {
            name: 'creatorId',
            type: 'string',
            facet: true,
            optional: true,
        },
        {
            name: 'contributorIds',
            type: 'string[]',
            facet: true,
            optional: true,
        },
        {
            name: 'parentPageId',
            type: 'string',
            facet: true,
            optional: true,
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
        {
            name: 'embedding',
            type: 'float[]',
            num_dim: 1536,
            optional: true,
        },
    ],
    default_sorting_field: 'createdAt',
};
//# sourceMappingURL=page.schema.js.map