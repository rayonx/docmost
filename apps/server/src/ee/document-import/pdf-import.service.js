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
var PdfImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfImportService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const storage_service_1 = require("../../integrations/storage/storage.service");
const environment_service_1 = require("../../integrations/environment/environment.service");
const license_check_service_1 = require("../../integrations/environment/license-check.service");
const feature_registry_1 = require("../licence/feature-registry");
const attachment_utils_1 = require("../../core/attachment/attachment.utils");
const attachment_constants_1 = require("../../core/attachment/attachment.constants");
const uuid_1 = require("uuid");
const pdf_inspector_1 = require("@docmost/pdf-inspector");
const editor_ext_1 = require("@docmost/editor-ext");
let PdfImportService = PdfImportService_1 = class PdfImportService {
    constructor(storageService, environmentService, licenseCheckService, db) {
        this.storageService = storageService;
        this.environmentService = environmentService;
        this.licenseCheckService = licenseCheckService;
        this.db = db;
        this.logger = new common_1.Logger(PdfImportService_1.name);
    }
    async convertPdfToHtml(fileBuffer, workspaceId, spaceId, pageId, creatorId) {
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id', 'licenseKey'])
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        if (!this.environmentService.isCloud()) {
            if (!this.licenseCheckService.hasFeature(workspace.licenseKey, feature_registry_1.Feature.PDF_IMPORT)) {
                throw new common_1.ForbiddenException('This feature requires a valid license.');
            }
        }
        const result = (0, pdf_inspector_1.processPdfWithImages)(fileBuffer);
        let markdown = result.markdown ?? '';
        if (!markdown.trim()) {
            return '<p></p>';
        }
        if (result.images?.length > 0) {
            for (let i = 0; i < result.images.length; i++) {
                const image = result.images[i];
                const placeholder = `pdf-image://${i}`;
                if (!markdown.includes(placeholder)) {
                    continue;
                }
                try {
                    const ext = image.format === "Png" ? '.png' : '.jpeg';
                    const contentType = image.format === "Png" ? 'image/png' : 'image/jpeg';
                    const attachmentId = (0, uuid_1.v7)();
                    const fileName = `image${ext}`;
                    const storagePath = `${(0, attachment_utils_1.getAttachmentFolderPath)(attachment_constants_1.AttachmentType.File, workspaceId)}/${attachmentId}/${fileName}`;
                    const apiPath = `/api/files/${attachmentId}/${fileName}`;
                    await this.storageService.upload(storagePath, image.data);
                    await this.db
                        .insertInto('attachments')
                        .values({
                        id: attachmentId,
                        filePath: storagePath,
                        fileName: fileName,
                        fileSize: image.data.length,
                        mimeType: contentType,
                        type: 'file',
                        fileExt: ext,
                        creatorId: creatorId,
                        workspaceId: workspaceId,
                        pageId: pageId,
                        spaceId: spaceId,
                    })
                        .execute();
                    markdown = markdown.replace(placeholder, apiPath);
                }
                catch (err) {
                    this.logger.error({ err }, `Failed to process image ${i} during PDF import`);
                    markdown = markdown.replace(placeholder, '');
                }
            }
        }
        return (0, editor_ext_1.markdownToHtml)(markdown);
    }
};
exports.PdfImportService = PdfImportService;
exports.PdfImportService = PdfImportService = PdfImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [storage_service_1.StorageService,
        environment_service_1.EnvironmentService,
        license_check_service_1.LicenseCheckService, Object])
], PdfImportService);
//# sourceMappingURL=pdf-import.service.js.map