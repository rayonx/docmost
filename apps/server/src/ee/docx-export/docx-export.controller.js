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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxExportController = void 0;
const common_1 = require("@nestjs/common");
const docx_export_service_1 = require("./docx-export.service");
const docx_export_dto_1 = require("./dto/docx-export.dto");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const page_repo_1 = require("../../database/repos/page/page.repo");
const page_access_service_1 = require("../../core/page/page-access/page-access.service");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
const utils_1 = require("../../integrations/export/utils");
const helpers_1 = require("../../common/helpers");
const uuid_1 = require("uuid");
const audit_events_1 = require("../../common/events/audit-events");
const audit_service_1 = require("../../integrations/audit/audit.service");
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
let DocxExportController = class DocxExportController {
    constructor(docxExportService, pageRepo, pageAccessService, auditService) {
        this.docxExportService = docxExportService;
        this.pageRepo = pageRepo;
        this.pageAccessService = pageAccessService;
        this.auditService = auditService;
    }
    async exportPageAsDocx(dto, user, res) {
        const pageId = (0, uuid_1.validate)(dto.pageId)
            ? dto.pageId
            : (0, utils_1.extractPageSlugId)(dto.pageId);
        const page = await this.pageRepo.findById(pageId, {
            includeContent: true,
        });
        if (!page || page.deletedAt || page.workspaceId !== user.workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.pageAccessService.validateCanView(page, user);
        const buffer = await this.docxExportService.exportPageToDocx(page, user.id);
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_EXPORTED,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: page.id,
            spaceId: page.spaceId,
            metadata: {
                title: (0, helpers_1.getPageTitle)(page.title),
                format: 'docx',
                spaceId: page.spaceId,
            },
        });
        const fileName = (0, helpers_1.sanitizeFileName)(page.title || 'untitled', { preserveSpaces: true }) +
            '.docx';
        res.headers({
            'Content-Type': DOCX_MIME,
            'Content-Disposition': 'attachment; filename="' + encodeURIComponent(fileName) + '"',
        });
        res.send(buffer);
    }
};
exports.DocxExportController = DocxExportController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.DOCX_EXPORT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('docx-export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [docx_export_dto_1.ExportDocxDto, Object, Object]),
    __metadata("design:returntype", Promise)
], DocxExportController.prototype, "exportPageAsDocx", null);
exports.DocxExportController = DocxExportController = __decorate([
    (0, common_1.Controller)(),
    __param(3, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [docx_export_service_1.DocxExportService,
        page_repo_1.PageRepo,
        page_access_service_1.PageAccessService, Object])
], DocxExportController);
//# sourceMappingURL=docx-export.controller.js.map