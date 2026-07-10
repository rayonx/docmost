"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuerySchema = exports.sortsSchema = exports.sortSpecSchema = exports.filterGroupSchema = exports.filterNodeSchema = exports.conditionSchema = exports.operatorSchema = exports.MAX_SORTS = exports.MAX_FILTER_NODES = exports.MAX_FILTER_DEPTH = void 0;
exports.validateFilterTree = validateFilterTree;
const zod_1 = require("zod");
const base_id_schemas_1 = require("../base-id.schemas");
exports.MAX_FILTER_DEPTH = 5;
exports.MAX_FILTER_NODES = 50;
exports.MAX_SORTS = 5;
exports.operatorSchema = zod_1.z.enum([
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'contains',
    'ncontains',
    'startsWith',
    'endsWith',
    'isEmpty',
    'isNotEmpty',
    'before',
    'after',
    'onOrBefore',
    'onOrAfter',
    'any',
    'none',
    'all',
    'isWithin',
]);
exports.conditionSchema = zod_1.z.object({
    propertyId: base_id_schemas_1.propertyIdSchema,
    op: exports.operatorSchema,
    value: zod_1.z.unknown().optional(),
});
exports.filterNodeSchema = zod_1.z.lazy(() => zod_1.z.union([exports.conditionSchema, exports.filterGroupSchema]));
exports.filterGroupSchema = zod_1.z.lazy(() => zod_1.z.object({
    op: zod_1.z.enum(['and', 'or']),
    children: zod_1.z.array(exports.filterNodeSchema),
}));
function validateFilterTree(node) {
    let nodes = 0;
    const walk = (n, depth) => {
        if (depth > exports.MAX_FILTER_DEPTH) {
            throw new Error(`Filter tree exceeds max depth ${exports.MAX_FILTER_DEPTH}`);
        }
        nodes += 1;
        if (nodes > exports.MAX_FILTER_NODES) {
            throw new Error(`Filter tree exceeds max node count ${exports.MAX_FILTER_NODES}`);
        }
        if ('children' in n) {
            for (const c of n.children)
                walk(c, depth + 1);
        }
    };
    walk(node, 0);
}
exports.sortSpecSchema = zod_1.z.object({
    propertyId: base_id_schemas_1.propertyIdSchema,
    direction: zod_1.z.enum(['asc', 'desc']),
});
exports.sortsSchema = zod_1.z.array(exports.sortSpecSchema).max(exports.MAX_SORTS);
exports.listQuerySchema = zod_1.z.object({
    filter: exports.filterGroupSchema.optional(),
    sorts: exports.sortsSchema.optional(),
});
//# sourceMappingURL=schema.zod.js.map