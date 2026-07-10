"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURSOR_TAIL_KEYS = void 0;
exports.buildSorts = buildSorts;
const kysely_1 = require("kysely");
const kinds_1 = require("./kinds");
const property_type_registry_1 = require("../property-types/property-type.registry");
const extractors_1 = require("./extractors");
exports.CURSOR_TAIL_KEYS = ['position', 'id'];
function buildSorts(sorts, schema) {
    const out = [];
    for (let i = 0; i < sorts.length; i++) {
        const s = sorts[i];
        const prop = schema.get(s.propertyId);
        if (!prop)
            continue;
        const key = `s${i}`;
        const dir = s.direction;
        const sysCol = kinds_1.SYSTEM_COLUMN[prop.type];
        if (sysCol) {
            out.push({
                key,
                expression: (0, kysely_1.sql) `${kysely_1.sql.ref(sysCol)}`,
                direction: dir,
                valueType: prop.type === 'lastEditedBy' ? 'text' : 'date',
            });
            continue;
        }
        const kind = (0, property_type_registry_1.propertyKind)(prop.type);
        if (!kind)
            continue;
        out.push(wrapWithSentinel(s.propertyId, kind, dir, key));
    }
    return out;
}
function wrapWithSentinel(propertyId, kind, direction, key) {
    if (kind === kinds_1.PropertyKind.NUMERIC) {
        const sentinel = direction === 'asc'
            ? (0, kysely_1.sql) `'Infinity'::numeric`
            : (0, kysely_1.sql) `'-Infinity'::numeric`;
        return {
            key,
            expression: (0, kysely_1.sql) `COALESCE(${(0, extractors_1.numericCell)(propertyId)}, ${sentinel})`,
            direction,
            valueType: 'numeric',
        };
    }
    if (kind === kinds_1.PropertyKind.DATE) {
        const sentinel = direction === 'asc'
            ? (0, kysely_1.sql) `'infinity'::timestamptz`
            : (0, kysely_1.sql) `'-infinity'::timestamptz`;
        return {
            key,
            expression: (0, kysely_1.sql) `COALESCE(${(0, extractors_1.dateCell)(propertyId)}, ${sentinel})`,
            direction,
            valueType: 'date',
        };
    }
    if (kind === kinds_1.PropertyKind.BOOL) {
        const sentinel = direction === 'asc' ? (0, kysely_1.sql) `TRUE` : (0, kysely_1.sql) `FALSE`;
        return {
            key,
            expression: (0, kysely_1.sql) `COALESCE(${(0, extractors_1.boolCell)(propertyId)}, ${sentinel})`,
            direction,
            valueType: 'bool',
        };
    }
    const sentinel = direction === 'asc' ? (0, kysely_1.sql) `chr(1114111)` : (0, kysely_1.sql) `''`;
    return {
        key,
        expression: (0, kysely_1.sql) `COALESCE(${(0, extractors_1.textCell)(propertyId)}, ${sentinel})`,
        direction,
        valueType: 'text',
    };
}
//# sourceMappingURL=sort.js.map