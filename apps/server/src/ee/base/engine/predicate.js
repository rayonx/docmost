"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALSE_EXPR = exports.TRUE_EXPR = void 0;
exports.buildWhere = buildWhere;
const kysely_1 = require("kysely");
const kinds_1 = require("./kinds");
const base_schemas_1 = require("../base.schemas");
const property_type_registry_1 = require("../property-types/property-type.registry");
const extractors_1 = require("./extractors");
const relative_date_1 = require("./relative-date");
const TRUE = (0, kysely_1.sql) `TRUE`;
exports.TRUE_EXPR = TRUE;
const FALSE = (0, kysely_1.sql) `FALSE`;
exports.FALSE_EXPR = FALSE;
function buildWhere(eb, node, schema) {
    if ('children' in node) {
        if (node.children.length === 0)
            return TRUE;
        const built = node.children.map((c) => buildWhere(eb, c, schema));
        return node.op === 'and' ? eb.and(built) : eb.or(built);
    }
    return buildCondition(eb, node, schema);
}
function buildCondition(eb, cond, schema) {
    const prop = schema.get(cond.propertyId);
    if (!prop)
        return FALSE;
    const sysCol = kinds_1.SYSTEM_COLUMN[prop.type];
    if (sysCol)
        return systemCondition(eb, sysCol, prop.type, cond);
    const kind = (0, property_type_registry_1.propertyKind)(prop.type);
    if (!kind)
        return FALSE;
    switch (kind) {
        case kinds_1.PropertyKind.TEXT:
            return textCondition(eb, cond);
        case kinds_1.PropertyKind.NUMERIC:
            return numericCondition(eb, cond);
        case kinds_1.PropertyKind.DATE:
            return dateCondition(eb, cond);
        case kinds_1.PropertyKind.BOOL:
            return boolCondition(eb, cond);
        case kinds_1.PropertyKind.SELECT:
            return selectCondition(eb, cond);
        case kinds_1.PropertyKind.MULTI:
            return multiCondition(eb, cond);
        case kinds_1.PropertyKind.PERSON:
            return personCondition(eb, cond, prop);
        case kinds_1.PropertyKind.FILE:
            return arrayOfIdsCondition(eb, cond);
        case kinds_1.PropertyKind.PAGE:
            return pageCondition(eb, cond);
        default:
            return FALSE;
    }
}
function textCondition(eb, cond) {
    const expr = (0, extractors_1.textCell)(cond.propertyId);
    const val = cond.value;
    switch (cond.op) {
        case 'isEmpty':
            return eb.or([
                eb(expr, 'is', null),
                eb(expr, '=', ''),
            ]);
        case 'isNotEmpty':
            return eb.and([
                eb(expr, 'is not', null),
                eb(expr, '!=', ''),
            ]);
        case 'eq':
            return val == null ? FALSE : eb(expr, '=', String(val));
        case 'neq':
            return val == null
                ? FALSE
                : eb.or([
                    eb(expr, 'is', null),
                    eb(expr, '!=', String(val)),
                ]);
        case 'contains':
            return val == null
                ? FALSE
                : eb(expr, 'ilike', `%${(0, extractors_1.escapeIlike)(String(val))}%`);
        case 'ncontains':
            return val == null
                ? FALSE
                : eb.or([
                    eb(expr, 'is', null),
                    eb(expr, 'not ilike', `%${(0, extractors_1.escapeIlike)(String(val))}%`),
                ]);
        case 'startsWith':
            return val == null
                ? FALSE
                : eb(expr, 'ilike', `${(0, extractors_1.escapeIlike)(String(val))}%`);
        case 'endsWith':
            return val == null
                ? FALSE
                : eb(expr, 'ilike', `%${(0, extractors_1.escapeIlike)(String(val))}`);
        default:
            return FALSE;
    }
}
function numericCondition(eb, cond) {
    const expr = (0, extractors_1.numericCell)(cond.propertyId);
    const raw = cond.value;
    const num = raw == null ? null : Number(raw);
    const bad = num == null || Number.isNaN(num);
    switch (cond.op) {
        case 'isEmpty':
            return eb(expr, 'is', null);
        case 'isNotEmpty':
            return eb(expr, 'is not', null);
        case 'eq':
            return bad ? FALSE : eb(expr, '=', num);
        case 'neq':
            return bad
                ? FALSE
                : eb.or([eb(expr, 'is', null), eb(expr, '!=', num)]);
        case 'gt':
            return bad ? FALSE : eb(expr, '>', num);
        case 'gte':
            return bad ? FALSE : eb(expr, '>=', num);
        case 'lt':
            return bad ? FALSE : eb(expr, '<', num);
        case 'lte':
            return bad ? FALSE : eb(expr, '<=', num);
        default:
            return FALSE;
    }
}
function dateCondition(eb, cond) {
    const expr = (0, extractors_1.dateCell)(cond.propertyId);
    switch (cond.op) {
        case 'isEmpty':
            return eb(expr, 'is', null);
        case 'isNotEmpty':
            return eb(expr, 'is not', null);
        default: {
            const r = (0, relative_date_1.resolveDateOperand)(cond.value);
            if (!r)
                return FALSE;
            return dateOperatorSql(eb, expr, cond.op, r);
        }
    }
}
function dateOperatorSql(eb, expr, op, r) {
    if (op === 'isWithin') {
        if (r.kind !== 'range')
            return FALSE;
        return eb.and([
            eb(expr, '>=', r.start),
            eb(expr, '<', r.end),
        ]);
    }
    if (r.kind !== 'instant')
        return FALSE;
    const at = r.at;
    const next = new Date(at.getTime());
    next.setUTCDate(next.getUTCDate() + 1);
    switch (op) {
        case 'eq':
            return eb.and([eb(expr, '>=', at), eb(expr, '<', next)]);
        case 'before':
            return eb(expr, '<', at);
        case 'after':
            return eb(expr, '>=', next);
        case 'onOrBefore':
            return eb(expr, '<', next);
        case 'onOrAfter':
            return eb(expr, '>=', at);
        default:
            return FALSE;
    }
}
function boolCondition(eb, cond) {
    const expr = (0, extractors_1.boolCell)(cond.propertyId);
    switch (cond.op) {
        case 'isEmpty':
            return eb(expr, 'is', null);
        case 'isNotEmpty':
            return eb(expr, 'is not', null);
        case 'eq':
            return cond.value == null
                ? FALSE
                : eb(expr, '=', Boolean(cond.value));
        case 'neq':
            return cond.value == null
                ? FALSE
                : eb.or([
                    eb(expr, 'is', null),
                    eb(expr, '!=', Boolean(cond.value)),
                ]);
        default:
            return FALSE;
    }
}
function selectCondition(eb, cond) {
    const expr = (0, extractors_1.textCell)(cond.propertyId);
    const val = cond.value;
    switch (cond.op) {
        case 'isEmpty':
            return eb.or([
                eb(expr, 'is', null),
                eb(expr, '=', ''),
            ]);
        case 'isNotEmpty':
            return eb.and([
                eb(expr, 'is not', null),
                eb(expr, '!=', ''),
            ]);
        case 'eq':
            return val == null ? FALSE : eb(expr, '=', String(val));
        case 'neq':
            return val == null
                ? FALSE
                : eb.or([
                    eb(expr, 'is', null),
                    eb(expr, '!=', String(val)),
                ]);
        case 'any': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return FALSE;
            return eb(expr, 'in', arr);
        }
        case 'none': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return TRUE;
            return eb.or([
                eb(expr, 'is', null),
                eb(expr, 'not in', arr),
            ]);
        }
        default:
            return FALSE;
    }
}
function multiCondition(eb, cond) {
    return arrayOfIdsCondition(eb, cond);
}
function personCondition(eb, cond, prop) {
    if ((0, base_schemas_1.personAllowsMultiple)(prop.typeOptions)) {
        return arrayOfIdsCondition(eb, cond);
    }
    const expr = (0, extractors_1.textCell)(cond.propertyId);
    const val = cond.value;
    switch (cond.op) {
        case 'isEmpty':
            return eb.or([
                eb(expr, 'is', null),
                eb(expr, '=', ''),
            ]);
        case 'isNotEmpty':
            return eb.and([
                eb(expr, 'is not', null),
                eb(expr, '!=', ''),
            ]);
        case 'eq':
            return val == null ? FALSE : eb(expr, '=', String(val));
        case 'neq':
            return val == null
                ? FALSE
                : eb.or([
                    eb(expr, 'is', null),
                    eb(expr, '!=', String(val)),
                ]);
        case 'any': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return FALSE;
            return eb(expr, 'in', arr);
        }
        case 'none': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return TRUE;
            return eb.or([
                eb(expr, 'is', null),
                eb(expr, 'not in', arr),
            ]);
        }
        default:
            return FALSE;
    }
}
function pageCondition(eb, cond) {
    const expr = (0, extractors_1.textCell)(cond.propertyId);
    const val = cond.value;
    switch (cond.op) {
        case 'isEmpty':
            return eb.or([
                eb(expr, 'is', null),
                eb(expr, '=', ''),
            ]);
        case 'isNotEmpty':
            return eb.and([
                eb(expr, 'is not', null),
                eb(expr, '!=', ''),
            ]);
        case 'eq':
            return val == null ? FALSE : eb(expr, '=', String(val));
        case 'neq':
            return val == null
                ? FALSE
                : eb.or([
                    eb(expr, 'is', null),
                    eb(expr, '!=', String(val)),
                ]);
        case 'any': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return FALSE;
            return eb(expr, 'in', arr);
        }
        case 'none': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return TRUE;
            return eb.or([
                eb(expr, 'is', null),
                eb(expr, 'not in', arr),
            ]);
        }
        default:
            return FALSE;
    }
}
function arrayOfIdsCondition(eb, cond) {
    const expr = (0, extractors_1.arrayCell)(cond.propertyId);
    const val = cond.value;
    switch (cond.op) {
        case 'isEmpty':
            return eb.or([
                eb(expr, 'is', null),
                (0, kysely_1.sql) `(CASE WHEN jsonb_typeof(${expr}) = 'array' THEN jsonb_array_length(${expr}) = 0 ELSE FALSE END)`,
            ]);
        case 'isNotEmpty':
            return eb.or([
                (0, kysely_1.sql) `(CASE WHEN jsonb_typeof(${expr}) = 'array' THEN jsonb_array_length(${expr}) > 0 ELSE FALSE END)`,
                (0, kysely_1.sql) `jsonb_typeof(${expr}) = 'string'`,
            ]);
        case 'eq': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return FALSE;
            return (0, kysely_1.sql) `${expr} @> ${JSON.stringify(arr)}::text::jsonb`;
        }
        case 'neq': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return FALSE;
            return eb.or([
                eb(expr, 'is', null),
                (0, kysely_1.sql) `NOT (${expr} @> ${JSON.stringify(arr)}::text::jsonb)`,
            ]);
        }
        case 'any': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return FALSE;
            return (0, kysely_1.sql) `${expr} ?| ${arr}`;
        }
        case 'all': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return TRUE;
            return (0, kysely_1.sql) `${expr} @> ${JSON.stringify(arr)}::text::jsonb`;
        }
        case 'none': {
            const arr = asStringArray(val);
            if (arr.length === 0)
                return TRUE;
            return eb.or([
                eb(expr, 'is', null),
                (0, kysely_1.sql) `NOT (${expr} ?| ${arr})`,
            ]);
        }
        default:
            return FALSE;
    }
}
function systemCondition(eb, column, propertyType, cond) {
    const ref = eb.ref(column);
    const val = cond.value;
    if (propertyType === 'lastEditedBy') {
        switch (cond.op) {
            case 'isEmpty':
                return eb(ref, 'is', null);
            case 'isNotEmpty':
                return eb(ref, 'is not', null);
            case 'eq':
                return val == null ? FALSE : eb(ref, '=', String(val));
            case 'neq':
                return val == null
                    ? FALSE
                    : eb.or([eb(ref, 'is', null), eb(ref, '!=', String(val))]);
            case 'any': {
                const arr = asStringArray(val);
                if (arr.length === 0)
                    return FALSE;
                return eb(ref, 'in', arr);
            }
            case 'none': {
                const arr = asStringArray(val);
                if (arr.length === 0)
                    return TRUE;
                return eb.or([eb(ref, 'is', null), eb(ref, 'not in', arr)]);
            }
            default:
                return FALSE;
        }
    }
    switch (cond.op) {
        case 'isEmpty':
            return FALSE;
        case 'isNotEmpty':
            return TRUE;
        default: {
            const r = (0, relative_date_1.resolveDateOperand)(cond.value);
            if (!r)
                return FALSE;
            return dateOperatorSql(eb, ref, cond.op, r);
        }
    }
}
function asStringArray(val) {
    if (val == null)
        return [];
    if (Array.isArray(val))
        return val.filter((v) => v != null).map(String);
    return [String(val)];
}
//# sourceMappingURL=predicate.js.map