"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentImportModule = void 0;
const common_1 = require("@nestjs/common");
const docx_import_service_1 = require("./docx-import.service");
const pdf_import_service_1 = require("./pdf-import.service");
const storage_module_1 = require("../../integrations/storage/storage.module");
const license_module_1 = require("../licence/license.module");
let DocumentImportModule = class DocumentImportModule {
};
exports.DocumentImportModule = DocumentImportModule;
exports.DocumentImportModule = DocumentImportModule = __decorate([
    (0, common_1.Module)({
        providers: [docx_import_service_1.DocxImportService, pdf_import_service_1.PdfImportService],
        exports: [docx_import_service_1.DocxImportService, pdf_import_service_1.PdfImportService],
        imports: [storage_module_1.StorageModule, license_module_1.LicenseModule],
    })
], DocumentImportModule);
//# sourceMappingURL=document-import.module.js.map