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
var DocxImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxImportService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const storage_service_1 = require("../../integrations/storage/storage.service");
const environment_service_1 = require("../../integrations/environment/environment.service");
const license_check_service_1 = require("../../integrations/environment/license-check.service");
const feature_registry_1 = require("../licence/feature-registry");
const attachment_utils_1 = require("../../core/attachment/attachment.utils");
const attachment_constants_1 = require("../../core/attachment/attachment.constants");
const uuid_1 = require("uuid");
const mammoth = require("mammoth");
const mime = require("mime-types");
let DocxImportService = DocxImportService_1 = class DocxImportService {
    constructor(storageService, environmentService, licenseCheckService, db) {
        this.storageService = storageService;
        this.environmentService = environmentService;
        this.licenseCheckService = licenseCheckService;
        this.db = db;
        this.logger = new common_1.Logger(DocxImportService_1.name);
    }
    async convertDocxToHtml(fileBuffer, workspaceId, spaceId, pageId, creatorId) {
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id', 'licenseKey'])
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        if (!this.environmentService.isCloud()) {
            if (!this.licenseCheckService.hasFeature(workspace.licenseKey, feature_registry_1.Feature.DOCX_IMPORT)) {
                throw new common_1.ForbiddenException('This feature requires a valid license.');
            }
        }
        const result = await mammoth.convertToHtml({ buffer: fileBuffer }, {
            convertImage: mammoth.images.imgElement(async (image) => {
                try {
                    const imageBuffer = await image.read();
                    const contentType = image.contentType || 'image/png';
                    const ext = '.' + (mime.extension(contentType) || 'png');
                    const attachmentId = (0, uuid_1.v7)();
                    const fileName = `image${ext}`;
                    const storagePath = `${(0, attachment_utils_1.getAttachmentFolderPath)(attachment_constants_1.AttachmentType.File, workspaceId)}/${attachmentId}/${fileName}`;
                    const apiPath = `/api/files/${attachmentId}/${fileName}`;
                    await this.storageService.upload(storagePath, imageBuffer);
                    await this.db
                        .insertInto('attachments')
                        .values({
                        id: attachmentId,
                        filePath: storagePath,
                        fileName: fileName,
                        fileSize: imageBuffer.length,
                        mimeType: contentType,
                        type: 'file',
                        fileExt: ext,
                        creatorId: creatorId,
                        workspaceId: workspaceId,
                        pageId: pageId,
                        spaceId: spaceId,
                    })
                        .execute();
                    return {
                        src: apiPath,
                        'data-attachment-id': attachmentId,
                        width: '100%',
                        'data-align': 'center',
                    };
                }
                catch (err) {
                    this.logger.error({ err }, 'Failed to process image during DOCX import');
                    return { src: '' };
                }
            }),
        });
        if (result.messages?.length > 0) {
            for (const msg of result.messages) {
                if (msg.type === 'warning') {
                    this.logger.warn(`Mammoth warning: ${msg.message}`);
                }
            }
        }
        return result.value;
    }
};
exports.DocxImportService = DocxImportService;
exports.DocxImportService = DocxImportService = DocxImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [storage_service_1.StorageService,
        environment_service_1.EnvironmentService,
        license_check_service_1.LicenseCheckService, Object])
], DocxImportService);
//# sourceMappingURL=docx-import.service.js.map