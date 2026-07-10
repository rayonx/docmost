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
var PdfExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const token_service_1 = require("../../core/auth/services/token.service");
const environment_service_1 = require("../../integrations/environment/environment.service");
const domain_service_1 = require("../../integrations/environment/domain.service");
const gotenberg_client_1 = require("./gotenberg.client");
const nestjs_kysely_1 = require("nestjs-kysely");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../integrations/queue/constants");
const file_utils_1 = require("../../integrations/import/utils/file.utils");
const uuid_1 = require("uuid");
const storage_service_1 = require("../../integrations/storage/storage.service");
const helpers_1 = require("../../common/helpers");
const EXPORT_TTL_HOURS = 24;
let PdfExportService = PdfExportService_1 = class PdfExportService {
    constructor(tokenService, environmentService, domainService, gotenbergClient, storageService, db, fileTaskQueue) {
        this.tokenService = tokenService;
        this.environmentService = environmentService;
        this.domainService = domainService;
        this.gotenbergClient = gotenbergClient;
        this.storageService = storageService;
        this.db = db;
        this.fileTaskQueue = fileTaskQueue;
        this.logger = new common_1.Logger(PdfExportService_1.name);
    }
    async requestExport(page, userId) {
        const cached = await this.findCachedExport(page);
        if (cached) {
            this.logger.debug(`Cache hit for page ${page.id}, reusing fileTask ${cached.id}`);
            return { fileTaskId: cached.id };
        }
        const fileTaskId = (0, uuid_1.v7)();
        const fileName = (0, helpers_1.sanitizeFileName)(page.title || 'untitled') + '.pdf';
        const filePath = `${(0, file_utils_1.getFileTaskFolderPath)(file_utils_1.FileTaskType.Export, page.workspaceId)}/${fileTaskId}/${fileName}`;
        await this.db
            .insertInto('fileTasks')
            .values({
            id: fileTaskId,
            type: file_utils_1.FileTaskType.Export,
            status: file_utils_1.FileTaskStatus.Processing,
            fileName,
            filePath,
            fileExt: 'pdf',
            pageId: page.id,
            creatorId: userId,
            spaceId: page.spaceId,
            workspaceId: page.workspaceId,
        })
            .execute();
        await this.fileTaskQueue.add(constants_1.QueueJob.PDF_EXPORT_TASK, { fileTaskId }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });
        this.logger.debug(`Queued PDF export for page ${page.id}, fileTask ${fileTaskId}`);
        return { fileTaskId };
    }
    async generateAndStorePdf(fileTaskId) {
        const fileTask = await this.db
            .selectFrom('fileTasks')
            .selectAll()
            .where('id', '=', fileTaskId)
            .executeTakeFirst();
        if (!fileTask || !fileTask.pageId) {
            throw new Error(`File task ${fileTaskId} not found or has no pageId`);
        }
        const page = await this.db
            .selectFrom('pages')
            .selectAll()
            .where('id', '=', fileTask.pageId)
            .executeTakeFirst();
        if (!page) {
            throw new Error(`Page ${fileTask.pageId} not found`);
        }
        const pdfBuffer = await this.exportPageToPdf(page);
        await this.storageService.upload(fileTask.filePath, pdfBuffer);
        await this.db
            .updateTable('fileTasks')
            .set({
            status: file_utils_1.FileTaskStatus.Success,
            fileSize: pdfBuffer.length,
            updatedAt: new Date(),
        })
            .where('id', '=', fileTaskId)
            .execute();
        this.logger.debug(`PDF export completed for fileTask ${fileTaskId}, size: ${pdfBuffer.length}`);
    }
    async exportPageToPdf(page) {
        const token = await this.tokenService.generatePdfRenderToken(page.id, page.workspaceId);
        const appUrl = this.environmentService.getAppUrl();
        const renderUrl = `${appUrl}/pdf-render/${page.id}?token=${token}`;
        this.logger.debug(`Generating PDF for page ${page.id}`);
        return this.gotenbergClient.convertUrlToPdf(renderUrl);
    }
    async generateExportUrl(fileTaskId, workspaceId) {
        const token = await this.tokenService.generatePdfExportDownloadToken(fileTaskId, workspaceId);
        const workspace = await this.db
            .selectFrom('workspaces')
            .select('hostname')
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        const baseUrl = this.domainService.getUrl(workspace?.hostname);
        return `${baseUrl}/api/pdf-export/download/${fileTaskId}?token=${token}`;
    }
    async findCachedExport(page) {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - EXPORT_TTL_HOURS);
        return this.db
            .selectFrom('fileTasks')
            .selectAll()
            .where('pageId', '=', page.id)
            .where('workspaceId', '=', page.workspaceId)
            .where('type', '=', file_utils_1.FileTaskType.Export)
            .where('status', 'in', [file_utils_1.FileTaskStatus.Success, file_utils_1.FileTaskStatus.Processing])
            .where('deletedAt', 'is', null)
            .where('createdAt', '>', cutoff)
            .where('createdAt', '>=', page.updatedAt ? new Date(page.updatedAt) : new Date(0))
            .orderBy('id', 'desc')
            .limit(1)
            .executeTakeFirst();
    }
    async cleanupExpiredExports() {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - EXPORT_TTL_HOURS);
        const expired = await this.db
            .selectFrom('fileTasks')
            .select(['id', 'filePath', 'status'])
            .where('type', '=', file_utils_1.FileTaskType.Export)
            .where('status', 'in', [file_utils_1.FileTaskStatus.Success, file_utils_1.FileTaskStatus.Failed])
            .where('deletedAt', 'is', null)
            .where('createdAt', '<', cutoff)
            .execute();
        if (expired.length === 0) {
            this.logger.debug('No expired PDF exports to clean up');
            return;
        }
        this.logger.log(`Cleaning up ${expired.length} expired PDF exports`);
        for (const task of expired) {
            if (task.status === file_utils_1.FileTaskStatus.Success) {
                try {
                    await this.storageService.delete(task.filePath);
                }
                catch (err) {
                    this.logger.warn(`Failed to delete storage file for task ${task.id}: ${err?.message}`);
                }
            }
        }
        const expiredIds = expired.map((t) => t.id);
        await this.db
            .updateTable('fileTasks')
            .set({ deletedAt: new Date() })
            .where('id', 'in', expiredIds)
            .execute();
        this.logger.log(`Cleaned up ${expired.length} expired PDF exports`);
    }
    async scheduleCleanup() {
        try {
            await this.fileTaskQueue.add(constants_1.QueueJob.PDF_EXPORT_CLEANUP, {}, {
                jobId: 'pdf-export-cleanup',
                removeOnComplete: true,
                removeOnFail: true,
            });
        }
        catch (err) {
            this.logger.error({ err }, 'Failed to schedule PDF export cleanup');
        }
    }
};
exports.PdfExportService = PdfExportService;
__decorate([
    (0, schedule_1.Interval)('pdf-export-cleanup', 24 * 60 * 60 * 1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PdfExportService.prototype, "scheduleCleanup", null);
exports.PdfExportService = PdfExportService = PdfExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, nestjs_kysely_1.InjectKysely)()),
    __param(6, (0, bullmq_1.InjectQueue)(constants_1.QueueName.FILE_TASK_QUEUE)),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        environment_service_1.EnvironmentService,
        domain_service_1.DomainService,
        gotenberg_client_1.GotenbergClient,
        storage_service_1.StorageService, Object, bullmq_2.Queue])
], PdfExportService);
//# sourceMappingURL=pdf-export.service.js.map