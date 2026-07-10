"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.choiceIdSchema = exports.propertyIdSchema = exports.CHOICE_ID_REGEX = exports.PROPERTY_ID_REGEX = void 0;
const zod_1 = require("zod");
exports.PROPERTY_ID_REGEX = /^prp[0-9a-z]{9}$/;
exports.CHOICE_ID_REGEX = /^opt[0-9a-z]{9}$/;
exports.propertyIdSchema = zod_1.z.string().regex(exports.PROPERTY_ID_REGEX);
exports.choiceIdSchema = zod_1.z.string().regex(exports.CHOICE_ID_REGEX);
//# sourceMappingURL=base-id.schemas.js.map