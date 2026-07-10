"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudModule = void 0;
const common_1 = require("@nestjs/common");
const token_module_1 = require("../../core/auth/token.module");
const workspace_cloud_controller_1 = require("./controllers/workspace.cloud.controller");
const workspace_cloud_service_1 = require("./services/workspace.cloud.service");
const sso_module_1 = require("../sso/sso.module");
const auth_module_1 = require("../../core/auth/auth.module");
let CloudModule = class CloudModule {
};
exports.CloudModule = CloudModule;
exports.CloudModule = CloudModule = __decorate([
    (0, common_1.Module)({
        controllers: [workspace_cloud_controller_1.WorkspaceCloudController],
        providers: [workspace_cloud_service_1.WorkspaceCloudService],
        exports: [workspace_cloud_service_1.WorkspaceCloudService],
        imports: [sso_module_1.SsoModule, token_module_1.TokenModule, auth_module_1.AuthModule],
    })
], CloudModule);
//# sourceMappingURL=cloud.module.js.map