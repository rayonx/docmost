"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULTABLE_PROPERTY_TYPES = void 0;
exports.normalizeSelectDefaultValue = normalizeSelectDefaultValue;
exports.normalizePersonDefaultValue = normalizePersonDefaultValue;
exports.resolveDefaultCellForType = resolveDefaultCellForType;
exports.backfillDefaultForTypeChange = backfillDefaultForTypeChange;
exports.buildDefaultCells = buildDefaultCells;
const base_schemas_1 = require("../base.schemas");
const property_type_registry_1 = require("./property-type.registry");
exports.DEFAULTABLE_PROPERTY_TYPES = new Set([
    base_schemas_1.BasePropertyType.TEXT,
    base_schemas_1.BasePropertyType.LONG_TEXT,
    base_schemas_1.BasePropertyType.NUMBER,
    base_schemas_1.BasePropertyType.SELECT,
    base_schemas_1.BasePropertyType.STATUS,
    base_schemas_1.BasePropertyType.MULTI_SELECT,
    base_schemas_1.BasePropertyType.CHECKBOX,
    base_schemas_1.BasePropertyType.URL,
    base_schemas_1.BasePropertyType.EMAIL,
    base_schemas_1.BasePropertyType.PERSON,
]);
const CHOICE_PROPERTY_TYPES = new Set([
    base_schemas_1.BasePropertyType.SELECT,
    base_schemas_1.BasePropertyType.STATUS,
    base_schemas_1.BasePropertyType.MULTI_SELECT,
]);
function normalizeSelectDefaultValue(options, opts) {
    const dv = options.defaultValue;
    if (dv === undefined || dv === null)
        return options;
    const ids = new Set((options.choices ?? []).map((c) => c.id));
    if (Array.isArray(dv)) {
        if (!opts.multi || dv.length === 0) {
            return { ...options, defaultValue: null };
        }
        const live = dv.filter((id) => ids.has(id));
        if (live.length === dv.length)
            return options;
        return { ...options, defaultValue: live.length ? live : null };
    }
    return ids.has(dv) ? options : { ...options, defaultValue: null };
}
function normalizePersonDefaultValue(options) {
    const dv = options.defaultValue;
    if (dv === undefined || dv === null)
        return options;
    if (options.allowMultiple === true) {
        if (!Array.isArray(dv))
            return { ...options, defaultValue: [dv] };
        return dv.length ? options : { ...options, defaultValue: null };
    }
    if (!Array.isArray(dv))
        return options;
    return { ...options, defaultValue: dv[0] ?? null };
}
function resolveDefaultCellForType(type, typeOptions) {
    if (!exports.DEFAULTABLE_PROPERTY_TYPES.has(type))
        return null;
    const opts = (typeOptions ?? {});
    let value = opts.defaultValue;
    if (value === undefined || value === null)
        return null;
    if (CHOICE_PROPERTY_TYPES.has(type)) {
        value = resolveChoiceDefault(type, value, opts.choices ?? []);
        if (value === null)
            return null;
    }
    const result = (0, property_type_registry_1.validateCellValue)(type, value, typeOptions);
    return result.success ? result.data : null;
}
function backfillDefaultForTypeChange(fromType, toType, clearMode, toTypeOptions) {
    if (fromType === toType || clearMode)
        return null;
    return resolveDefaultCellForType(toType, toTypeOptions);
}
function buildDefaultCells(properties, providedCells) {
    const defaults = {};
    for (const property of properties) {
        if (property.pendingType)
            continue;
        if (property.id in providedCells)
            continue;
        const value = resolveDefaultCellForType(property.type, property.typeOptions);
        if (value === null)
            continue;
        defaults[property.id] = value;
    }
    return defaults;
}
function resolveChoiceDefault(type, value, choices) {
    const ids = new Set(choices.map((c) => c.id));
    if (type === base_schemas_1.BasePropertyType.MULTI_SELECT) {
        const arr = Array.isArray(value) ? value : [value];
        const live = arr.filter((id) => typeof id === 'string' && ids.has(id));
        return live.length ? live : null;
    }
    return typeof value === 'string' && ids.has(value) ? value : null;
}
//# sourceMappingURL=default-values.js.map