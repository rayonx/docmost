"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyModule = void 0;
const common_1 = require("@nestjs/common");
const api_key_service_1 = require("./api-key.service");
const api_key_controller_1 = require("./api-key.controller");
const token_module_1 = require("../../core/auth/token.module");
let ApiKeyModule = class ApiKeyModule {
};
exports.ApiKeyModule = ApiKeyModule;
exports.ApiKeyModule = ApiKeyModule = __decorate([
    (0, common_1.Module)({
        imports: [token_module_1.TokenModule],
        providers: [api_key_service_1.ApiKeyService],
        exports: [api_key_service_1.ApiKeyService],
        controllers: [api_key_controller_1.ApiKeyController],
    })
], ApiKeyModule);
//# sourceMappingURL=api-key.module.js.map