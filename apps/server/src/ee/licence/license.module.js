"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LicenseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseModule = void 0;
const common_1 = require("@nestjs/common");
const license_controller_1 = require("./license.controller");
const license_service_1 = require("./license.service");
const jwt = require("jsonwebtoken");
const environment_service_1 = require("../../integrations/environment/environment.service");
const license_constant_1 = require("./license.constant");
let LicenseModule = LicenseModule_1 = class LicenseModule {
    constructor(environmentService, licenseService) {
        this.environmentService = environmentService;
        this.licenseService = licenseService;
        this.logger = new common_1.Logger(LicenseModule_1.name);
    }
    async onApplicationBootstrap() {
        // Bypass: Skip license validation
    }
};
exports.LicenseModule = LicenseModule;
exports.LicenseModule = LicenseModule = LicenseModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [license_controller_1.LicenseController],
        providers: [license_service_1.LicenseService],
        exports: [license_service_1.LicenseService],
    }),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService,
        license_service_1.LicenseService])
], LicenseModule);
//# sourceMappingURL=license.module.js.map