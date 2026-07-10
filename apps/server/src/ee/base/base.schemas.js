"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewConfigPatchSchema = exports.viewConfigSchema = exports.NO_VALUE_CHOICE_ID = exports.viewSortSchema = exports.fileCellSchema = exports.formulaTypeOptionsSchema = exports.emptyTypeOptionsSchema = exports.personTypeOptionsSchema = exports.emailTypeOptionsSchema = exports.urlTypeOptionsSchema = exports.checkboxTypeOptionsSchema = exports.longTextTypeOptionsSchema = exports.textTypeOptionsSchema = exports.dateTypeOptionsSchema = exports.numberTypeOptionsSchema = exports.selectTypeOptionsSchema = exports.choiceSchema = exports.MAX_FILE_REFS_PER_CELL = exports.MAX_PERSON_REFS_PER_CELL = exports.MAX_MULTI_SELECT_PER_CELL = exports.BASE_VIEW_TYPES = exports.BaseViewType = exports.BASE_PROPERTY_TYPES = exports.BasePropertyType = void 0;
exports.choiceIdSet = choiceIdSet;
exports.personAllowsMultiple = personAllowsMultiple;
exports.personCellSchemaFor = personCellSchemaFor;
exports.cellShapeMatchesType = cellShapeMatchesType;
exports.isAlreadyConvertedCell = isAlreadyConvertedCell;
exports.attemptCellConversion = attemptCellConversion;
const zod_1 = require("zod");
const base_id_schemas_1 = require("./base-id.schemas");
const csv_format_1 = require("./property-types/csv-format");
const reference_source_1 = require("./reference/reference-source");
exports.BasePropertyType = {
    TEXT: 'text',
    NUMBER: 'number',
    SELECT: 'select',
    STATUS: 'status',
    MULTI_SELECT: 'multiSelect',
    DATE: 'date',
    PERSON: 'person',
    FILE: 'file',
    PAGE: 'page',
    CHECKBOX: 'checkbox',
    URL: 'url',
    EMAIL: 'email',
    CREATED_AT: 'createdAt',
    LAST_EDITED_AT: 'lastEditedAt',
    LAST_EDITED_BY: 'lastEditedBy',
    FORMULA: 'formula',
    LONG_TEXT: 'longText',
};
exports.BASE_PROPERTY_TYPES = Object.values(exports.BasePropertyType);
exports.BaseViewType = {
    TABLE: 'table',
    KANBAN: 'kanban',
    CALENDAR: 'calendar',
};
exports.BASE_VIEW_TYPES = Object.values(exports.BaseViewType);
exports.MAX_MULTI_SELECT_PER_CELL = 100;
exports.MAX_PERSON_REFS_PER_CELL = 100;
exports.MAX_FILE_REFS_PER_CELL = 50;
exports.choiceSchema = zod_1.z.object({
    id: base_id_schemas_1.choiceIdSchema,
    name: zod_1.z.string().min(1),
    color: zod_1.z.string(),
    category: zod_1.z.enum(['todo', 'inProgress', 'complete']).optional(),
});
exports.selectTypeOptionsSchema = zod_1.z
    .object({
    choices: zod_1.z.array(exports.choiceSchema).default([]),
    choiceOrder: zod_1.z.array(base_id_schemas_1.choiceIdSchema).default([]),
    disableColors: zod_1.z.boolean().optional(),
    defaultValue: zod_1.z
        .union([base_id_schemas_1.choiceIdSchema, zod_1.z.array(base_id_schemas_1.choiceIdSchema)])
        .nullable()
        .optional(),
})
    .loose();
exports.numberTypeOptionsSchema = zod_1.z
    .object({
    format: zod_1.z
        .enum(['plain', 'currency', 'percent', 'progress'])
        .optional()
        .default('plain'),
    separators: zod_1.z
        .enum([
        'none',
        'local',
        'comma_period',
        'period_comma',
        'space_comma',
        'space_period',
    ])
        .optional(),
    precision: zod_1.z.number().int().min(0).max(10).optional(),
    currencyCode: zod_1.z.string().max(8).optional(),
    currencySymbol: zod_1.z.string().max(5).optional(),
    defaultValue: zod_1.z.number().nullable().optional(),
})
    .loose();
exports.dateTypeOptionsSchema = zod_1.z
    .object({
    dateFormat: zod_1.z.string().optional(),
    timeFormat: zod_1.z.enum(['12h', '24h']).optional(),
    includeTime: zod_1.z.boolean().optional(),
    defaultValue: zod_1.z.string().nullable().optional(),
})
    .loose();
exports.textTypeOptionsSchema = zod_1.z
    .object({
    richText: zod_1.z.boolean().optional(),
    defaultValue: zod_1.z.string().max(1000).nullable().optional(),
})
    .loose();
exports.longTextTypeOptionsSchema = zod_1.z
    .object({
    defaultValue: zod_1.z.string().max(25000).nullable().optional(),
})
    .loose();
exports.checkboxTypeOptionsSchema = zod_1.z
    .object({
    defaultValue: zod_1.z.boolean().nullable().optional(),
})
    .loose();
exports.urlTypeOptionsSchema = zod_1.z
    .object({
    defaultValue: zod_1.z.url().nullable().optional(),
})
    .loose();
exports.emailTypeOptionsSchema = zod_1.z
    .object({
    defaultValue: zod_1.z.email().nullable().optional(),
})
    .loose();
exports.personTypeOptionsSchema = zod_1.z
    .object({
    allowMultiple: zod_1.z.boolean().default(false),
    defaultValue: zod_1.z
        .union([zod_1.z.uuid(), zod_1.z.array(zod_1.z.uuid()).max(exports.MAX_PERSON_REFS_PER_CELL)])
        .nullable()
        .optional(),
})
    .loose();
exports.emptyTypeOptionsSchema = zod_1.z.object({}).loose();
exports.formulaTypeOptionsSchema = zod_1.z
    .object({
    source: zod_1.z.string().min(1).max(2048),
    ast: zod_1.z.any(),
    resultType: zod_1.z.enum(['number', 'string', 'boolean', 'date', 'null']),
    dependencies: zod_1.z.array(base_id_schemas_1.propertyIdSchema),
    astVersion: zod_1.z.literal(1),
    formatOptions: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
})
    .loose();
function choiceIdSet(typeOptions) {
    const choices = typeOptions?.choices;
    if (!Array.isArray(choices))
        return null;
    return new Set(choices.map((c) => c.id));
}
function dropNonMemberChoices(toType, value, toTypeOptions) {
    if (toType !== exports.BasePropertyType.SELECT &&
        toType !== exports.BasePropertyType.STATUS &&
        toType !== exports.BasePropertyType.MULTI_SELECT) {
        return value;
    }
    const ids = choiceIdSet(toTypeOptions);
    if (!ids)
        return value;
    if (toType === exports.BasePropertyType.MULTI_SELECT) {
        if (!Array.isArray(value))
            return null;
        const kept = Array.from(new Set(value.filter((v) => typeof v === 'string' && ids.has(v))));
        return kept.length > 0 ? kept : null;
    }
    return typeof value === 'string' && ids.has(value) ? value : null;
}
exports.fileCellSchema = zod_1.z
    .array(zod_1.z.object({
    id: zod_1.z.uuid(),
    fileName: zod_1.z.string().max(255),
    mimeType: zod_1.z.string().max(255).optional(),
    fileSize: zod_1.z.number().min(0).optional(),
    filePath: zod_1.z.string().max(2048).optional(),
}))
    .max(exports.MAX_FILE_REFS_PER_CELL);
function personAllowsMultiple(typeOptions) {
    return (typeOptions
        ?.allowMultiple === true);
}
function personCellSchemaFor(typeOptions) {
    return personAllowsMultiple(typeOptions)
        ? zod_1.z.union([
            zod_1.z.array(zod_1.z.uuid()).max(exports.MAX_PERSON_REFS_PER_CELL),
            zod_1.z.uuid().transform((v) => [v]),
        ])
        : zod_1.z.union([
            zod_1.z.uuid(),
            zod_1.z
                .array(zod_1.z.uuid())
                .max(1)
                .transform((a) => a[0] ?? null),
        ]);
}
const anyShapePersonCellSchema = zod_1.z.union([zod_1.z.uuid(), zod_1.z.array(zod_1.z.uuid())]);
const cellValueSchemaMap = {
    [exports.BasePropertyType.TEXT]: zod_1.z.string().max(1000),
    [exports.BasePropertyType.NUMBER]: zod_1.z.number(),
    [exports.BasePropertyType.SELECT]: base_id_schemas_1.choiceIdSchema,
    [exports.BasePropertyType.STATUS]: base_id_schemas_1.choiceIdSchema,
    [exports.BasePropertyType.MULTI_SELECT]: zod_1.z
        .array(base_id_schemas_1.choiceIdSchema)
        .max(exports.MAX_MULTI_SELECT_PER_CELL),
    [exports.BasePropertyType.DATE]: zod_1.z.string(),
    [exports.BasePropertyType.PERSON]: anyShapePersonCellSchema,
    [exports.BasePropertyType.FILE]: exports.fileCellSchema,
    [exports.BasePropertyType.PAGE]: zod_1.z.uuid(),
    [exports.BasePropertyType.CHECKBOX]: zod_1.z.boolean(),
    [exports.BasePropertyType.URL]: zod_1.z.url(),
    [exports.BasePropertyType.EMAIL]: zod_1.z.email(),
    [exports.BasePropertyType.LONG_TEXT]: zod_1.z.string().max(25000),
};
const shapeOnlyFileCellSchema = zod_1.z.array(zod_1.z.object({ id: zod_1.z.uuid(), fileName: zod_1.z.string() }).loose());
function cellShapeMatchesType(type, value) {
    const schema = type === exports.BasePropertyType.PERSON
        ? anyShapePersonCellSchema
        : type === exports.BasePropertyType.MULTI_SELECT
            ? zod_1.z.array(base_id_schemas_1.choiceIdSchema)
            : type === exports.BasePropertyType.FILE
                ? shapeOnlyFileCellSchema
                : cellValueSchemaMap[type];
    if (!schema)
        return false;
    return schema.safeParse(value).success;
}
const ID_RESOLVING_SOURCES = new Set([
    exports.BasePropertyType.SELECT,
    exports.BasePropertyType.STATUS,
    exports.BasePropertyType.MULTI_SELECT,
    exports.BasePropertyType.PERSON,
    exports.BasePropertyType.FILE,
    exports.BasePropertyType.PAGE,
]);
const SINGLE_CHOICE_TYPES = new Set([
    exports.BasePropertyType.SELECT,
    exports.BasePropertyType.STATUS,
]);
function isAlreadyConvertedCell(fromType, toType, value) {
    if (toType !== exports.BasePropertyType.TEXT &&
        toType !== exports.BasePropertyType.LONG_TEXT) {
        return false;
    }
    if (!ID_RESOLVING_SOURCES.has(fromType))
        return false;
    if (value === null || value === undefined)
        return false;
    return !cellShapeMatchesType(fromType, value);
}
function attemptCellConversion(fromType, toType, value, ctx) {
    if (value === null || value === undefined) {
        return { converted: true, value: null };
    }
    if (toType === exports.BasePropertyType.TEXT ||
        toType === exports.BasePropertyType.LONG_TEXT) {
        if (fromType === exports.BasePropertyType.SELECT ||
            fromType === exports.BasePropertyType.STATUS) {
            const name = (0, csv_format_1.resolveChoiceName)(ctx.fromTypeOptions, value);
            return { converted: true, value: name ?? '' };
        }
        if (fromType === exports.BasePropertyType.MULTI_SELECT && Array.isArray(value)) {
            const parts = value
                .map((v) => (0, csv_format_1.resolveChoiceName)(ctx.fromTypeOptions, v))
                .filter((v) => typeof v === 'string' && v.length > 0);
            return { converted: true, value: parts.join(', ') };
        }
        if (fromType === exports.BasePropertyType.PERSON ||
            fromType === exports.BasePropertyType.FILE ||
            fromType === exports.BasePropertyType.PAGE) {
            return {
                converted: true,
                value: (0, reference_source_1.resolveReferenceDisplay)(fromType, value, ctx).join(', '),
            };
        }
    }
    if (toType === exports.BasePropertyType.PAGE && fromType !== exports.BasePropertyType.PAGE) {
        return { converted: true, value: null };
    }
    if (toType === exports.BasePropertyType.PERSON) {
        const parsed = anyShapePersonCellSchema.safeParse(value);
        if (!parsed.success) {
            return { converted: false, value: null };
        }
        const cell = parsed.data;
        if (personAllowsMultiple(ctx.toTypeOptions)) {
            return { converted: true, value: Array.isArray(cell) ? cell : [cell] };
        }
        return {
            converted: true,
            value: Array.isArray(cell) ? (cell[0] ?? null) : cell,
        };
    }
    const targetSchema = cellValueSchemaMap[toType];
    if (!targetSchema) {
        return { converted: false, value: null };
    }
    const directResult = targetSchema.safeParse(value);
    if (directResult.success) {
        return {
            converted: true,
            value: dropNonMemberChoices(toType, directResult.data, ctx.toTypeOptions),
        };
    }
    if (toType === exports.BasePropertyType.TEXT ||
        toType === exports.BasePropertyType.LONG_TEXT) {
        return { converted: true, value: String(value) };
    }
    if (toType === exports.BasePropertyType.NUMBER && typeof value === 'string') {
        const num = Number(value);
        if (!isNaN(num)) {
            return { converted: true, value: num };
        }
    }
    if (toType === exports.BasePropertyType.CHECKBOX) {
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            if (lower === 'true' || lower === '1' || lower === 'yes') {
                return { converted: true, value: true };
            }
            if (lower === 'false' || lower === '0' || lower === 'no' || lower === '') {
                return { converted: true, value: false };
            }
        }
        if (typeof value === 'number') {
            return { converted: true, value: value !== 0 };
        }
    }
    if (toType === exports.BasePropertyType.MULTI_SELECT &&
        SINGLE_CHOICE_TYPES.has(fromType) &&
        typeof value === 'string') {
        return {
            converted: true,
            value: dropNonMemberChoices(toType, [value], ctx.toTypeOptions),
        };
    }
    if (SINGLE_CHOICE_TYPES.has(toType) &&
        fromType === exports.BasePropertyType.MULTI_SELECT &&
        Array.isArray(value) &&
        value.length > 0) {
        return {
            converted: true,
            value: dropNonMemberChoices(toType, value[0], ctx.toTypeOptions),
        };
    }
    return { converted: false, value: null };
}
exports.viewSortSchema = zod_1.z.object({
    propertyId: base_id_schemas_1.propertyIdSchema,
    direction: zod_1.z.enum(['asc', 'desc']),
});
const viewFilterConditionSchema = zod_1.z.object({
    propertyId: base_id_schemas_1.propertyIdSchema,
    op: zod_1.z.enum([
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
    ]),
    value: zod_1.z.unknown().optional(),
});
const viewFilterNodeSchema = zod_1.z.lazy(() => zod_1.z.union([viewFilterConditionSchema, viewFilterGroupSchema]));
const viewFilterGroupSchema = zod_1.z.lazy(() => zod_1.z.object({
    op: zod_1.z.enum(['and', 'or']),
    children: zod_1.z.array(viewFilterNodeSchema),
}));
exports.NO_VALUE_CHOICE_ID = '__no_value';
exports.viewConfigSchema = zod_1.z
    .object({
    sorts: zod_1.z.array(exports.viewSortSchema).optional(),
    filter: viewFilterGroupSchema.optional(),
    visiblePropertyIds: zod_1.z.array(base_id_schemas_1.propertyIdSchema).optional(),
    hiddenPropertyIds: zod_1.z.array(base_id_schemas_1.propertyIdSchema).optional(),
    propertyWidths: zod_1.z.record(zod_1.z.string(), zod_1.z.number().positive()).optional(),
    propertyOrder: zod_1.z.array(base_id_schemas_1.propertyIdSchema).optional(),
    groupByPropertyId: base_id_schemas_1.propertyIdSchema.optional(),
    hiddenChoiceIds: zod_1.z.array(zod_1.z.string()).optional(),
    choiceOrder: zod_1.z.array(zod_1.z.string()).optional(),
})
    .loose();
exports.viewConfigPatchSchema = zod_1.z
    .object({
    sorts: zod_1.z.array(exports.viewSortSchema).nullish(),
    filter: viewFilterGroupSchema.nullish(),
    visiblePropertyIds: zod_1.z.array(base_id_schemas_1.propertyIdSchema).nullish(),
    hiddenPropertyIds: zod_1.z.array(base_id_schemas_1.propertyIdSchema).nullish(),
    propertyWidths: zod_1.z.record(zod_1.z.string(), zod_1.z.number().positive()).nullish(),
    propertyOrder: zod_1.z.array(base_id_schemas_1.propertyIdSchema).nullish(),
    groupByPropertyId: base_id_schemas_1.propertyIdSchema.nullish(),
    hiddenChoiceIds: zod_1.z.array(zod_1.z.string()).nullish(),
    choiceOrder: zod_1.z.array(zod_1.z.string()).nullish(),
})
    .loose();
//# sourceMappingURL=base.schemas.js.map