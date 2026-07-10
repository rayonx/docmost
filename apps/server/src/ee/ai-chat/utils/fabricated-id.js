"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFabricatedId = isFabricatedId;
const FABRICATED_PATTERNS = [
    /^0{8}-0{4}-0{4}-0{4}-0{12}$/,
    /^f{8}-f{4}-f{4}-f{4}-f{12}$/i,
    /^[0-9a-f]{8}-0000-0000-0000-[0-9a-f]+$/i,
    /^12345678-/,
    /^aaaaaaaa-/i,
    /^deadbeef-/i,
];
function isFabricatedId(id) {
    return FABRICATED_PATTERNS.some((p) => p.test(id));
}
//# sourceMappingURL=fabricated-id.js.map