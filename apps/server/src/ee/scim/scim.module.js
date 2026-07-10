"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScimModule = void 0;
const common_1 = require("@nestjs/common");
const scim_controller_1 = require("./controllers/scim.controller");
const scim_user_service_1 = require("./services/scim-user.service");
const scim_middleware_1 = require("./scim.middleware");
const scim_group_service_1 = require("./services/scim-group.service");
const scim_token_service_1 = require("./services/scim-token.service");
const scim_token_controller_1 = require("./controllers/scim-token.controller");
const scim_auth_guard_1 = require("./guards/scim-auth.guard");
const group_module_1 = require("../../core/group/group.module");
let ScimModule = class ScimModule {
    configure(consumer) {
        consumer.apply(scim_middleware_1.ScimMiddleware).forRoutes(scim_controller_1.ScimController);
    }
};
exports.ScimModule = ScimModule;
exports.ScimModule = ScimModule = __decorate([
    (0, common_1.Module)({
        controllers: [scim_controller_1.ScimController, scim_token_controller_1.ScimTokenController],
        providers: [
            scim_user_service_1.ScimUserService,
            scim_group_service_1.ScimGroupService,
            scim_token_service_1.ScimTokenService,
            scim_auth_guard_1.ScimAuthGuard,
        ],
        exports: [scim_token_service_1.ScimTokenService],
        imports: [group_module_1.GroupModule],
    })
], ScimModule);
//# sourceMappingURL=scim.module.js.map