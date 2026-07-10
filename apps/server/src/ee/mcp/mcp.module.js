"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpModule = void 0;
const common_1 = require("@nestjs/common");
const mcp_controller_1 = require("./mcp.controller");
const mcp_service_1 = require("./mcp.service");
const mcp_tools_service_1 = require("./mcp-tools.service");
const page_module_1 = require("../../core/page/page.module");
const space_module_1 = require("../../core/space/space.module");
const comment_module_1 = require("../../core/comment/comment.module");
const search_module_1 = require("../../core/search/search.module");
const workspace_module_1 = require("../../core/workspace/workspace.module");
let McpModule = class McpModule {
};
exports.McpModule = McpModule;
exports.McpModule = McpModule = __decorate([
    (0, common_1.Module)({
        imports: [page_module_1.PageModule, space_module_1.SpaceModule, comment_module_1.CommentModule, search_module_1.SearchModule, workspace_module_1.WorkspaceModule],
        controllers: [mcp_controller_1.McpController],
        providers: [mcp_service_1.McpService, mcp_tools_service_1.McpToolsService],
    })
], McpModule);
//# sourceMappingURL=mcp.module.js.map