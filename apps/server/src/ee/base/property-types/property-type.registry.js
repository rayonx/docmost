"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_PROPERTY_TYPES = exports.SYSTEM_PROPERTY_TYPES = exports.PROPERTY_TYPE_REGISTRY = void 0;
exports.getDescriptor = getDescriptor;
exports.propertyKind = propertyKind;
exports.isSystemPropertyType = isSystemPropertyType;
exports.systemColumnFor = systemColumnFor;
exports.formulaResultType = formulaResultType;
exports.serializeCellForCsv = serializeCellForCsv;
exports.validateTypeOptions = validateTypeOptions;
exports.parseTypeOptions = parseTypeOptions;
exports.getCellValueSchema = getCellValueSchema;
exports.validateCellValue = validateCellValue;
const zod_1 = require("zod");
const base_schemas_1 = require("../base.schemas");
const base_id_schemas_1 = require("../base-id.schemas");
const kinds_1 = require("../engine/kinds");
const csv_format_1 = require("./csv-format");
const reference_source_1 = require("../reference/reference-source");
const textCsv = (v) => (0, csv_format_1.neutralizeCsvFormula)(String(v));
const numberCsv = (v) => typeof v === 'number' ? String(v) : String(v ?? '');
const checkboxCsv = (v) => (v === true ? 'true' : 'false');
const dateCsv = (v) => v instanceof Date ? v.toISOString() : String(v);
const choiceCsv = (v, _c, to) => (0, csv_format_1.neutralizeCsvFormula)((0, csv_format_1.resolveChoiceName)(to, v));
const multiCsv = (v, _c, to) => Array.isArray(v)
    ? v
        .map((x) => (0, csv_format_1.resolveChoiceName)(to, x))
        .filter((s) => s.length > 0)
        .map(csv_format_1.neutralizeCsvFormula)
        .join('; ')
    : '';
const personCsv = (v, ctx) => (0, reference_source_1.resolveReferenceDisplay)('person', v, ctx)
    .map(csv_format_1.neutralizeCsvFormula)
    .join('; ');
const fileCsv = (v, ctx) => (0, reference_source_1.resolveReferenceDisplay)('file', v, ctx).map(csv_format_1.neutralizeCsvFormula).join('; ');
const lastEditedByCsv = (v, ctx) => (0, csv_format_1.neutralizeCsvFormula)((0, csv_format_1.resolveUser)(v, ctx));
const pageCsv = (v, ctx) => (0, reference_source_1.resolveReferenceDisplay)('page', v, ctx).map(csv_format_1.neutralizeCsvFormula).join('; ');
const jsonCsv = (v) => (0, csv_format_1.neutralizeCsvFormula)(typeof v === 'object' ? JSON.stringify(v) : String(v));
exports.PROPERTY_TYPE_REGISTRY = {
    [base_schemas_1.BasePropertyType.TEXT]: {
        type: base_schemas_1.BasePropertyType.TEXT,
        kind: kinds_1.PropertyKind.TEXT,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.textTypeOptionsSchema,
        cellValueSchema: zod_1.z.string().max(1000),
        formulaResultType: 'string',
        csvSerialize: textCsv,
    },
    [base_schemas_1.BasePropertyType.LONG_TEXT]: {
        type: base_schemas_1.BasePropertyType.LONG_TEXT,
        kind: kinds_1.PropertyKind.TEXT,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.longTextTypeOptionsSchema,
        cellValueSchema: zod_1.z.string().max(25000),
        formulaResultType: 'string',
        csvSerialize: textCsv,
    },
    [base_schemas_1.BasePropertyType.URL]: {
        type: base_schemas_1.BasePropertyType.URL,
        kind: kinds_1.PropertyKind.TEXT,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.urlTypeOptionsSchema,
        cellValueSchema: zod_1.z.url(),
        formulaResultType: 'string',
        csvSerialize: textCsv,
    },
    [base_schemas_1.BasePropertyType.EMAIL]: {
        type: base_schemas_1.BasePropertyType.EMAIL,
        kind: kinds_1.PropertyKind.TEXT,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.emailTypeOptionsSchema,
        cellValueSchema: zod_1.z.email(),
        formulaResultType: 'string',
        csvSerialize: textCsv,
    },
    [base_schemas_1.BasePropertyType.NUMBER]: {
        type: base_schemas_1.BasePropertyType.NUMBER,
        kind: kinds_1.PropertyKind.NUMERIC,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.numberTypeOptionsSchema,
        cellValueSchema: zod_1.z.number(),
        formulaResultType: 'number',
        csvSerialize: numberCsv,
    },
    [base_schemas_1.BasePropertyType.CHECKBOX]: {
        type: base_schemas_1.BasePropertyType.CHECKBOX,
        kind: kinds_1.PropertyKind.BOOL,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.checkboxTypeOptionsSchema,
        cellValueSchema: zod_1.z.boolean(),
        formulaResultType: 'boolean',
        csvSerialize: checkboxCsv,
    },
    [base_schemas_1.BasePropertyType.DATE]: {
        type: base_schemas_1.BasePropertyType.DATE,
        kind: kinds_1.PropertyKind.DATE,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.dateTypeOptionsSchema,
        cellValueSchema: zod_1.z.string(),
        formulaResultType: 'date',
        csvSerialize: dateCsv,
    },
    [base_schemas_1.BasePropertyType.SELECT]: {
        type: base_schemas_1.BasePropertyType.SELECT,
        kind: kinds_1.PropertyKind.SELECT,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.selectTypeOptionsSchema,
        cellValueSchema: base_id_schemas_1.choiceIdSchema,
        formulaResultType: 'null',
        csvSerialize: choiceCsv,
    },
    [base_schemas_1.BasePropertyType.STATUS]: {
        type: base_schemas_1.BasePropertyType.STATUS,
        kind: kinds_1.PropertyKind.SELECT,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.selectTypeOptionsSchema,
        cellValueSchema: base_id_schemas_1.choiceIdSchema,
        formulaResultType: 'null',
        csvSerialize: choiceCsv,
    },
    [base_schemas_1.BasePropertyType.MULTI_SELECT]: {
        type: base_schemas_1.BasePropertyType.MULTI_SELECT,
        kind: kinds_1.PropertyKind.MULTI,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.selectTypeOptionsSchema,
        cellValueSchema: zod_1.z.array(base_id_schemas_1.choiceIdSchema).max(base_schemas_1.MAX_MULTI_SELECT_PER_CELL),
        formulaResultType: 'null',
        csvSerialize: multiCsv,
    },
    [base_schemas_1.BasePropertyType.PERSON]: {
        type: base_schemas_1.BasePropertyType.PERSON,
        kind: kinds_1.PropertyKind.PERSON,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.personTypeOptionsSchema,
        cellValueSchema: zod_1.z.union([zod_1.z.uuid(), zod_1.z.array(zod_1.z.uuid())]),
        formulaResultType: 'null',
        csvSerialize: personCsv,
        referenceKind: 'person',
    },
    [base_schemas_1.BasePropertyType.FILE]: {
        type: base_schemas_1.BasePropertyType.FILE,
        kind: kinds_1.PropertyKind.FILE,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.emptyTypeOptionsSchema,
        cellValueSchema: base_schemas_1.fileCellSchema,
        formulaResultType: 'null',
        csvSerialize: fileCsv,
        referenceKind: 'file',
    },
    [base_schemas_1.BasePropertyType.PAGE]: {
        type: base_schemas_1.BasePropertyType.PAGE,
        kind: kinds_1.PropertyKind.PAGE,
        isSystem: false,
        typeOptionsSchema: base_schemas_1.emptyTypeOptionsSchema,
        cellValueSchema: zod_1.z.uuid(),
        formulaResultType: 'null',
        csvSerialize: pageCsv,
        referenceKind: 'page',
    },
    [base_schemas_1.BasePropertyType.CREATED_AT]: {
        type: base_schemas_1.BasePropertyType.CREATED_AT,
        kind: kinds_1.PropertyKind.DATE,
        isSystem: true,
        systemColumn: 'createdAt',
        typeOptionsSchema: base_schemas_1.emptyTypeOptionsSchema,
        formulaResultType: 'date',
        csvSerialize: dateCsv,
    },
    [base_schemas_1.BasePropertyType.LAST_EDITED_AT]: {
        type: base_schemas_1.BasePropertyType.LAST_EDITED_AT,
        kind: kinds_1.PropertyKind.DATE,
        isSystem: true,
        systemColumn: 'updatedAt',
        typeOptionsSchema: base_schemas_1.emptyTypeOptionsSchema,
        formulaResultType: 'date',
        csvSerialize: dateCsv,
    },
    [base_schemas_1.BasePropertyType.LAST_EDITED_BY]: {
        type: base_schemas_1.BasePropertyType.LAST_EDITED_BY,
        kind: kinds_1.PropertyKind.SYS_USER,
        isSystem: true,
        systemColumn: 'lastUpdatedById',
        typeOptionsSchema: base_schemas_1.emptyTypeOptionsSchema,
        formulaResultType: 'null',
        csvSerialize: lastEditedByCsv,
    },
    [base_schemas_1.BasePropertyType.FORMULA]: {
        type: base_schemas_1.BasePropertyType.FORMULA,
        kind: null,
        isSystem: true,
        typeOptionsSchema: base_schemas_1.formulaTypeOptionsSchema,
        formulaResultType: 'null',
        csvSerialize: jsonCsv,
    },
};
function getDescriptor(type) {
    return exports.PROPERTY_TYPE_REGISTRY[type];
}
function propertyKind(type) {
    return getDescriptor(type)?.kind ?? null;
}
exports.SYSTEM_PROPERTY_TYPES = new Set(base_schemas_1.BASE_PROPERTY_TYPES.filter((t) => exports.PROPERTY_TYPE_REGISTRY[t].isSystem));
function isSystemPropertyType(type) {
    return exports.SYSTEM_PROPERTY_TYPES.has(type);
}
exports.USER_PROPERTY_TYPES = base_schemas_1.BASE_PROPERTY_TYPES.filter((t) => !exports.PROPERTY_TYPE_REGISTRY[t].isSystem);
function systemColumnFor(type) {
    return getDescriptor(type)?.systemColumn;
}
function formulaResultType(type) {
    return getDescriptor(type)?.formulaResultType ?? 'null';
}
function serializeCellForCsv(property, value, ctx) {
    if (value === null || value === undefined)
        return '';
    const d = getDescriptor(property.type);
    if (!d) {
        return (0, csv_format_1.neutralizeCsvFormula)(typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
    return d.csvSerialize(value, ctx, property.typeOptions);
}
function validateTypeOptions(type, typeOptions) {
    const schema = getDescriptor(type)?.typeOptionsSchema;
    if (!schema) {
        return {
            success: false,
            error: new zod_1.z.ZodError([
                {
                    code: 'custom',
                    message: `Unknown property type: ${type}`,
                    path: ['type'],
                },
            ]),
        };
    }
    return schema.safeParse(typeOptions ?? {});
}
function parseTypeOptions(type, typeOptions) {
    const result = validateTypeOptions(type, typeOptions);
    if (!result.success) {
        throw result.error;
    }
    return result.data;
}
function getCellValueSchema(type) {
    return getDescriptor(type)?.cellValueSchema;
}
function validateCellValue(type, value, typeOptions) {
    const schema = type === base_schemas_1.BasePropertyType.PERSON
        ? (0, base_schemas_1.personCellSchemaFor)(typeOptions)
        : getCellValueSchema(type);
    if (!schema) {
        return invalidCell(`Unknown property type: ${type}`);
    }
    const parsed = schema.safeParse(value);
    if (!parsed.success)
        return parsed;
    if (type === base_schemas_1.BasePropertyType.SELECT || type === base_schemas_1.BasePropertyType.STATUS) {
        const ids = (0, base_schemas_1.choiceIdSet)(typeOptions);
        if (ids && !ids.has(parsed.data)) {
            return invalidCell('Unknown choice id');
        }
    }
    if (type === base_schemas_1.BasePropertyType.MULTI_SELECT) {
        const ids = (0, base_schemas_1.choiceIdSet)(typeOptions);
        if (ids) {
            const arr = parsed.data;
            if (arr.some((v) => !ids.has(v))) {
                return invalidCell('Unknown choice id');
            }
            return { success: true, data: Array.from(new Set(arr)) };
        }
    }
    return parsed;
}
function invalidCell(message) {
    return {
        success: false,
        error: new zod_1.z.ZodError([{ code: 'custom', message, path: [] }]),
    };
}
//# sourceMappingURL=property-type.registry.js.map