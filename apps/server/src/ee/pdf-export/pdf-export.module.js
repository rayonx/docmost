"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportModule = void 0;
const common_1 = require("@nestjs/common");
const pdf_export_service_1 = require("./pdf-export.service");
const pdf_export_controller_1 = require("./pdf-export.controller");
const gotenberg_client_1 = require("./gotenberg.client");
const token_module_1 = require("../../core/auth/token.module");
let PdfExportModule = class PdfExportModule {
};
exports.PdfExportModule = PdfExportModule;
exports.PdfExportModule = PdfExportModule = __decorate([
    (0, common_1.Module)({
        imports: [token_module_1.TokenModule],
        providers: [pdf_export_service_1.PdfExportService, gotenberg_client_1.GotenbergClient],
        controllers: [pdf_export_controller_1.PdfExportController],
        exports: [pdf_export_service_1.PdfExportService],
    })
], PdfExportModule);
//# sourceMappingURL=pdf-export.module.js.map