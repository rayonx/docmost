"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPESENSE_LOCALE = exports.TYPESENSE_SCHEDULER_ID = exports.CollectionSchema = void 0;
var CollectionSchema;
(function (CollectionSchema) {
    CollectionSchema["PAGE"] = "pages";
    CollectionSchema["ATTACHMENT"] = "attachments";
    CollectionSchema["COMMENT"] = "comments";
})(CollectionSchema || (exports.CollectionSchema = CollectionSchema = {}));
exports.TYPESENSE_SCHEDULER_ID = 'typesense-flush-scheduler';
exports.TYPESENSE_LOCALE = process.env.TYPESENSE_LOCALE?.toLowerCase() || 'en';
//# sourceMappingURL=constants.js.map