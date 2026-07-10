"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textCell = textCell;
exports.numericCell = numericCell;
exports.dateCell = dateCell;
exports.boolCell = boolCell;
exports.arrayCell = arrayCell;
exports.escapeIlike = escapeIlike;
const kysely_1 = require("kysely");
function textCell(propertyId) {
    return (0, kysely_1.sql) `base_cell_text(cells, ${propertyId})`;
}
function numericCell(propertyId) {
    return (0, kysely_1.sql) `base_cell_numeric(cells, ${propertyId})`;
}
function dateCell(propertyId) {
    return (0, kysely_1.sql) `base_cell_timestamptz(cells, ${propertyId})`;
}
function boolCell(propertyId) {
    return (0, kysely_1.sql) `base_cell_bool(cells, ${propertyId})`;
}
function arrayCell(propertyId) {
    return (0, kysely_1.sql) `base_cell_array(cells, ${propertyId})`;
}
function escapeIlike(value) {
    return value.replace(/[%_\\]/g, '\\$&');
}
//# sourceMappingURL=extractors.js.map