"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentEeModule = void 0;
const common_1 = require("@nestjs/common");
const comment_resolution_service_1 = require("./comment-resolution.service");
const comment_resolution_controller_1 = require("./comment-resolution.controller");
const database_module_1 = require("../../database/database.module");
const core_module_1 = require("../../core/core.module");
const collaboration_module_1 = require("../../collaboration/collaboration.module");
let CommentEeModule = class CommentEeModule {
};
exports.CommentEeModule = CommentEeModule;
exports.CommentEeModule = CommentEeModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, core_module_1.CoreModule, collaboration_module_1.CollaborationModule],
        controllers: [comment_resolution_controller_1.CommentResolutionController],
        providers: [comment_resolution_service_1.CommentResolutionService],
        exports: [comment_resolution_service_1.CommentResolutionService],
    })
], CommentEeModule);
//# sourceMappingURL=comment-ee.module.js.map