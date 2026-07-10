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
exports.PdfExportController = void 0;
const common_1 = require("@nestjs/common");
const pdf_export_service_1 = require("./pdf-export.service");
const pdf_export_dto_1 = require("./dto/pdf-export.dto");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const page_repo_1 = require("../../database/repos/page/page.repo");
const page_access_service_1 = require("../../core/page/page-access/page-access.service");
const utils_1 = require("../../integrations/export/utils");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const token_service_1 = require("../../core/auth/services/token.service");
const jwt_payload_1 = require("../../core/auth/dto/jwt-payload");
const utils_2 = require("../../common/helpers/prosemirror/utils");
const collaboration_util_1 = require("../../collaboration/collaboration.util");
const share_util_1 = require("../../core/share/share.util");
const nestjs_kysely_1 = require("nestjs-kysely");
const storage_service_1 = require("../../integrations/storage/storage.service");
const space_ability_factory_1 = require("../../core/casl/abilities/space-ability.factory");
const space_ability_type_1 = require("../../core/casl/interfaces/space-ability.type");
const file_utils_1 = require("../../integrations/import/utils/file.utils");
let PdfExportController = class PdfExportController {
    constructor(pdfExportService, pageRepo, pageAccessService, tokenService, storageService, spaceAbility, db) {
        this.pdfExportService = pdfExportService;
        this.pageRepo = pageRepo;
        this.pageAccessService = pageAccessService;
        this.tokenService = tokenService;
        this.storageService = storageService;
        this.spaceAbility = spaceAbility;
        this.db = db;
    }
    async exportPageAsPdf(dto, user) {
        const pageId = (0, utils_1.extractPageSlugId)(dto.pageId) || dto.pageId;
        const page = await this.pageRepo.findById(pageId);
        if (!page || page.workspaceId !== user.workspaceId || page.deletedAt) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.pageAccessService.validateCanView(page, user);
        return this.pdfExportService.requestExport(page, user.id);
    }
    async getExportStatus(dto, user) {
        const fileTask = await this.db
            .selectFrom('fileTasks')
            .selectAll()
            .where('id', '=', dto.fileTaskId)
            .where('type', '=', file_utils_1.FileTaskType.Export)
            .where('deletedAt', 'is', null)
            .executeTakeFirst();
        if (!fileTask) {
            throw new common_1.NotFoundException('Export task not found');
        }
        if (fileTask.workspaceId !== user.workspaceId) {
            throw new common_1.NotFoundException('Export task not found');
        }
        if (fileTask.spaceId) {
            const ability = await this.spaceAbility.createForUser(user, fileTask.spaceId);
            if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
                throw new common_1.ForbiddenException();
            }
        }
        let exportUrl = null;
        if (fileTask.status === file_utils_1.FileTaskStatus.Success) {
            exportUrl = await this.pdfExportService.generateExportUrl(fileTask.id, fileTask.workspaceId);
        }
        return {
            fileTaskId: fileTask.id,
            status: fileTask.status,
            fileName: fileTask.fileName,
            fileSize: fileTask.fileSize,
            exportUrl,
            errorMessage: fileTask.errorMessage,
            createdAt: fileTask.createdAt,
            updatedAt: fileTask.updatedAt,
        };
    }
    async downloadExport(fileTaskId, token, res) {
        if (!token || !fileTaskId) {
            throw new common_1.BadRequestException('Token and fileTaskId are required');
        }
        let payload;
        try {
            payload = await this.tokenService.verifyJwt(token, jwt_payload_1.JwtType.PDF_EXPORT_DOWNLOAD);
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired download token');
        }
        if (payload.fileTaskId !== fileTaskId) {
            throw new common_1.BadRequestException('Invalid token');
        }
        const fileTask = await this.db
            .selectFrom('fileTasks')
            .selectAll()
            .where('id', '=', fileTaskId)
            .where('type', '=', file_utils_1.FileTaskType.Export)
            .where('deletedAt', 'is', null)
            .executeTakeFirst();
        if (!fileTask) {
            throw new common_1.NotFoundException('Export task not found');
        }
        if (fileTask.workspaceId !== payload.workspaceId) {
            throw new common_1.NotFoundException('Export task not found');
        }
        if (fileTask.status !== file_utils_1.FileTaskStatus.Success) {
            throw new common_1.BadRequestException('Export is not ready for download');
        }
        const fileExists = await this.storageService.exists(fileTask.filePath);
        if (!fileExists) {
            throw new common_1.NotFoundException('Export file not found. It may have expired.');
        }
        const fileStream = await this.storageService.readStream(fileTask.filePath);
        res.headers({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileTask.fileName)}"`,
        });
        if (fileTask.fileSize) {
            res.header('Content-Length', fileTask.fileSize.toString());
        }
        res.send(fileStream);
    }
    async getPdfRenderData(body) {
        const { pageId, token } = body;
        if (!token || !pageId) {
            throw new common_1.BadRequestException('Token and pageId are required');
        }
        let payload;
        try {
            payload = await this.tokenService.verifyJwt(token, jwt_payload_1.JwtType.PDF_RENDER);
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired PDF render token');
        }
        if (payload.pageId !== pageId) {
            throw new common_1.BadRequestException('Invalid token');
        }
        const page = await this.pageRepo.findById(pageId, {
            includeContent: true,
        });
        if (!page || page.deletedAt) {
            throw new common_1.NotFoundException('Page not found');
        }
        if (page.workspaceId !== payload.workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        const content = await this.prepareContentWithPublicAttachments(page);
        return {
            pageId: page.id,
            title: page.title,
            content,
        };
    }
    async prepareContentWithPublicAttachments(page) {
        const prosemirrorJson = (0, utils_2.getProsemirrorContent)(page.content);
        const attachmentIds = (0, utils_2.getAttachmentIds)(prosemirrorJson);
        if (attachmentIds.length === 0) {
            return prosemirrorJson;
        }
        const attachmentMap = new Map();
        await Promise.all(attachmentIds.map(async (attachmentId) => {
            const token = await this.tokenService.generateAttachmentToken({
                attachmentId,
                pageId: page.id,
                workspaceId: page.workspaceId,
            });
            attachmentMap.set(attachmentId, token);
        }));
        const doc = (0, collaboration_util_1.jsonToNode)(prosemirrorJson);
        doc?.descendants((node) => {
            if (!(0, utils_2.isAttachmentNode)(node.type.name))
                return;
            const attachmentId = node.attrs.attachmentId;
            const token = attachmentMap.get(attachmentId);
            if (!token)
                return;
            (0, share_util_1.updateAttachmentAttr)(node, 'src', token);
            (0, share_util_1.updateAttachmentAttr)(node, 'url', token);
        });
        return doc.toJSON();
    }
};
exports.PdfExportController = PdfExportController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.PDF_EXPORT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('pdf-export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pdf_export_dto_1.ExportPdfDto, Object]),
    __metadata("design:returntype", Promise)
], PdfExportController.prototype, "exportPageAsPdf", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.PDF_EXPORT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('pdf-export/status'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pdf_export_dto_1.ExportPdfStatusDto, Object]),
    __metadata("design:returntype", Promise)
], PdfExportController.prototype, "getExportStatus", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('pdf-export/download/:fileTaskId'),
    __param(0, (0, common_1.Param)('fileTaskId')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PdfExportController.prototype, "downloadExport", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('pdf-export/render'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PdfExportController.prototype, "getPdfRenderData", null);
exports.PdfExportController = PdfExportController = __decorate([
    (0, common_1.Controller)(),
    __param(6, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [pdf_export_service_1.PdfExportService,
        page_repo_1.PageRepo,
        page_access_service_1.PageAccessService,
        token_service_1.TokenService,
        storage_service_1.StorageService,
        space_ability_factory_1.default, Object])
], PdfExportController);
//# sourceMappingURL=pdf-export.controller.js.map