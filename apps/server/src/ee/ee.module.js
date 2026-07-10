"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EeModule = void 0;
const common_1 = require("@nestjs/common");
const billing_module_1 = require("./billing/billing.module");
const sso_module_1 = require("./sso/sso.module");
const cloud_module_1 = require("./cloud/cloud.module");
const license_module_1 = require("./licence/license.module");
const confluence_import_module_1 = require("./confluence-import/confluence-import.module");
const document_import_module_1 = require("./document-import/document-import.module");
const mfa_module_1 = require("./mfa/mfa.module");
const comment_ee_module_1 = require("./comment-ee/comment-ee.module");
const attachment_ee_module_1 = require("./attachments-ee/attachment-ee.module");
const ai_module_1 = require("./ai/ai.module");
const api_key_module_1 = require("./api-key/api-key.module");
const typesense_module_1 = require("./typesense/typesense.module");
const page_permission_module_1 = require("./page-permission/page-permission.module");
const audit_module_1 = require("./audit/audit.module");
const clickhouse_module_1 = require("./clickhouse/clickhouse.module");
const mcp_module_1 = require("./mcp/mcp.module");
const ai_chat_module_1 = require("./ai-chat/ai-chat.module");
const template_module_1 = require("./template/template.module");
const page_verification_module_1 = require("./page-verification/page-verification.module");
const pdf_export_module_1 = require("./pdf-export/pdf-export.module");
const docx_export_module_1 = require("./docx-export/docx-export.module");
const scim_module_1 = require("./scim/scim.module");
const personal_space_module_1 = require("./personal-space/personal-space.module");
const base_module_1 = require("./base/base.module");
let EeModule = class EeModule {
};
exports.EeModule = EeModule;
exports.EeModule = EeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            clickhouse_module_1.ClickHouseModule,
            audit_module_1.AuditModule,
            billing_module_1.BillingModule,
            sso_module_1.SsoModule,
            cloud_module_1.CloudModule,
            license_module_1.LicenseModule,
            confluence_import_module_1.ConfluenceImportModule,
            document_import_module_1.DocumentImportModule,
            mfa_module_1.MfaModule,
            comment_ee_module_1.CommentEeModule,
            attachment_ee_module_1.AttachmentEeModule,
            ai_module_1.AiModule,
            api_key_module_1.ApiKeyModule,
            typesense_module_1.TypesenseModule,
            page_permission_module_1.PagePermissionModule,
            page_verification_module_1.PageVerificationModule,
            mcp_module_1.McpModule,
            ai_chat_module_1.AiChatModule,
            template_module_1.TemplateModule,
            pdf_export_module_1.PdfExportModule,
            docx_export_module_1.DocxExportModule,
            scim_module_1.ScimModule,
            personal_space_module_1.PersonalSpaceModule,
            base_module_1.BaseModule,
        ],
        exports: [audit_module_1.AuditModule],
    })
], EeModule);
//# sourceMappingURL=ee.module.js.map