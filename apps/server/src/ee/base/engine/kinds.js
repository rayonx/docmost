"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_COLUMN = exports.PropertyKind = void 0;
exports.isSystemType = isSystemType;
const base_schemas_1 = require("../base.schemas");
exports.PropertyKind = {
    TEXT: 'text',
    NUMERIC: 'numeric',
    DATE: 'date',
    BOOL: 'bool',
    SELECT: 'select',
    MULTI: 'multi',
    PERSON: 'person',
    FILE: 'file',
    PAGE: 'page',
    SYS_USER: 'sys_user',
};
exports.SYSTEM_COLUMN = {
    [base_schemas_1.BasePropertyType.CREATED_AT]: 'createdAt',
    [base_schemas_1.BasePropertyType.LAST_EDITED_AT]: 'updatedAt',
    [base_schemas_1.BasePropertyType.LAST_EDITED_BY]: 'lastUpdatedById',
};
function isSystemType(type) {
    return type in exports.SYSTEM_COLUMN;
}
//# sourceMappingURL=kinds.js.map