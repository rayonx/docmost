"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = void 0;
const migration001 = require("./001_audit");
exports.migrations = [
    { name: '001_audit', up: migration001.up },
];
//# sourceMappingURL=index.js.map