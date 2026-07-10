import { z } from 'zod';
export declare const MAX_FILTER_DEPTH = 5;
export declare const MAX_FILTER_NODES = 50;
export declare const MAX_SORTS = 5;
export declare const operatorSchema: z.ZodEnum<{
    endsWith: "endsWith";
    startsWith: "startsWith";
    all: "all";
    none: "none";
    eq: "eq";
    after: "after";
    before: "before";
    any: "any";
    neq: "neq";
    gt: "gt";
    gte: "gte";
    lt: "lt";
    lte: "lte";
    contains: "contains";
    ncontains: "ncontains";
    isEmpty: "isEmpty";
    isNotEmpty: "isNotEmpty";
    onOrBefore: "onOrBefore";
    onOrAfter: "onOrAfter";
    isWithin: "isWithin";
}>;
export type Operator = z.infer<typeof operatorSchema>;
export declare const conditionSchema: z.ZodObject<{
    propertyId: z.ZodString;
    op: z.ZodEnum<{
        endsWith: "endsWith";
        startsWith: "startsWith";
        all: "all";
        none: "none";
        eq: "eq";
        after: "after";
        before: "before";
        any: "any";
        neq: "neq";
        gt: "gt";
        gte: "gte";
        lt: "lt";
        lte: "lte";
        contains: "contains";
        ncontains: "ncontains";
        isEmpty: "isEmpty";
        isNotEmpty: "isNotEmpty";
        onOrBefore: "onOrBefore";
        onOrAfter: "onOrAfter";
        isWithin: "isWithin";
    }>;
    value: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export type Condition = z.infer<typeof conditionSchema>;
export type FilterNode = Condition | FilterGroup;
export type FilterGroup = {
    op: 'and' | 'or';
    children: FilterNode[];
};
export declare const filterNodeSchema: z.ZodType<FilterNode>;
export declare const filterGroupSchema: z.ZodType<FilterGroup>;
export declare function validateFilterTree(node: FilterNode): void;
export declare const sortSpecSchema: z.ZodObject<{
    propertyId: z.ZodString;
    direction: z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>;
}, z.core.$strip>;
export type SortSpec = z.infer<typeof sortSpecSchema>;
export declare const sortsSchema: z.ZodArray<z.ZodObject<{
    propertyId: z.ZodString;
    direction: z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>;
}, z.core.$strip>>;
export declare const listQuerySchema: z.ZodObject<{
    filter: z.ZodOptional<z.ZodType<FilterGroup, unknown, z.core.$ZodTypeInternals<FilterGroup, unknown>>>;
    sorts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        propertyId: z.ZodString;
        direction: z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ListQuery = z.infer<typeof listQuerySchema>;
