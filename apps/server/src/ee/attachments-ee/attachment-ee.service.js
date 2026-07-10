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
var AttachmentEeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentEeService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const pdf_inspector_1 = require("@docmost/pdf-inspector");
const attachment_repo_1 = require("../../database/repos/attachment/attachment.repo");
const page_permission_repo_1 = require("../../database/repos/page/page-permission.repo");
const storage_service_1 = require("../../integrations/storage/storage.service");
const kysely_1 = require("kysely");
const path = require("path");
const mammoth = require("mammoth");
const space_member_repo_1 = require("../../database/repos/space/space-member.repo");
const postgres_1 = require("kysely/helpers/postgres");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../integrations/queue/constants");
const tsquery = require('pg-tsquery')();
let AttachmentEeService = AttachmentEeService_1 = class AttachmentEeService {
    constructor(attachmentRepo, pagePermissionRepo, storageService, db, spaceMemberRepo, attachmentQueue) {
        this.attachmentRepo = attachmentRepo;
        this.pagePermissionRepo = pagePermissionRepo;
        this.storageService = storageService;
        this.db = db;
        this.spaceMemberRepo = spaceMemberRepo;
        this.attachmentQueue = attachmentQueue;
        this.logger = new common_1.Logger(AttachmentEeService_1.name);
    }
    async indexAttachment(attachmentId) {
        if (!attachmentId)
            return;
        const attachment = await this.attachmentRepo.findById(attachmentId);
        if (!attachment) {
            return;
        }
        const supportedExtensions = ['.pdf', '.docx'];
        if (!supportedExtensions.includes(attachment.fileExt.toLowerCase())) {
            return;
        }
        let rawText = '';
        try {
            if (attachment.fileExt.toLowerCase() === '.pdf') {
                const file = await this.storageService.read(attachment.filePath);
                rawText = await this.convertPdfToMarkdown(file);
            }
            else if (attachment.fileExt.toLowerCase() === '.docx') {
                const file = await this.storageService.read(attachment.filePath);
                rawText = await this.convertDocxToText(file);
            }
        }
        catch (err) {
            this.logger.debug(`Failed to read or convert attachment file ${attachment.id}: ${err?.['message']}`);
            return;
        }
        const fileNameWithoutExt = path
            .basename(attachment.fileName, path.extname(attachment.fileName))
            .replace(/_/g, ' ');
        const preparedText = rawText.replace(/\n{2,}/g, '\n').substring(0, 1000000);
        await this.db
            .updateTable('attachments')
            .set({
            textContent: preparedText,
            tsv: (0, kysely_1.sql) `
          setweight(to_tsvector('english', f_unaccent(coalesce(${fileNameWithoutExt}, ''))), 'A') ||
          setweight(to_tsvector('english', f_unaccent(coalesce(${preparedText}, ''))), 'B')
        `,
        })
            .where('id', '=', attachmentId)
            .execute();
    }
    async searchAttachment(query, searchParams, opts) {
        if (query.length < 1) {
            return { items: [] };
        }
        const searchQuery = tsquery(query.trim() + '*');
        let queryResults = this.db
            .selectFrom('attachments')
            .innerJoin('pages', 'pages.id', 'attachments.pageId')
            .select([
            'attachments.id',
            'attachments.fileName',
            'attachments.pageId',
            'attachments.creatorId',
            'attachments.createdAt',
            'attachments.updatedAt',
            (0, kysely_1.sql) `ts_rank(attachments.tsv, to_tsquery('english', f_unaccent(${searchQuery})))`.as('rank'),
            (0, kysely_1.sql) `ts_headline('english', attachments.text_content, to_tsquery('english', f_unaccent(${searchQuery})),'MinWords=9, MaxWords=10, MaxFragments=3')`.as('highlight'),
        ])
            .select((eb) => this.withSpace(eb))
            .select((eb) => this.withPage(eb))
            .where('attachments.tsv', '@@', (0, kysely_1.sql) `to_tsquery('english', f_unaccent(${searchQuery}))`)
            .$if(Boolean(searchParams.creatorId), (qb) => qb.where('attachments.creatorId', '=', searchParams.creatorId))
            .where('pages.deletedAt', 'is', null)
            .orderBy('rank', 'desc')
            .limit(searchParams.limit || 20)
            .offset(searchParams.offset || 0);
        if (searchParams.spaceId) {
            queryResults = queryResults.where('attachments.spaceId', '=', searchParams.spaceId);
        }
        else if (opts.userId && !searchParams.spaceId) {
            queryResults = queryResults
                .where('attachments.spaceId', 'in', this.spaceMemberRepo.getUserSpaceIdsQuery(opts.userId))
                .where('attachments.workspaceId', '=', opts.workspaceId);
        }
        else {
            return { items: [] };
        }
        let results = await queryResults.execute();
        if (opts.userId && results.length > 0) {
            const pageIds = [...new Set(results.map((r) => r.pageId))];
            const accessibleIds = await this.pagePermissionRepo.filterAccessiblePageIds({
                pageIds,
                userId: opts.userId,
            });
            const accessibleSet = new Set(accessibleIds);
            results = results.filter((r) => accessibleSet.has(r.pageId));
        }
        const searchResults = results.map((result) => {
            if (result.highlight) {
                result.highlight = result.highlight
                    .replace(/\r\n|\r|\n/g, ' ')
                    .replace(/\s+/g, ' ');
            }
            return result;
        });
        return { items: searchResults };
    }
    async indexAttachments(workspaceId) {
        this.logger.debug(`Queuing attachments for indexing ${workspaceId ? `for workspace ${workspaceId}` : 'for all workspaces'}`);
        let query = this.db
            .selectFrom('attachments')
            .select(['id'])
            .where('textContent', 'is', null)
            .where('fileExt', 'in', ['.pdf', '.docx']);
        if (workspaceId) {
            query = query.where('workspaceId', '=', workspaceId);
        }
        const attachments = await query.execute();
        this.logger.debug(`Found ${attachments.length} attachments to index`);
        const jobs = attachments.map((attachment) => ({
            name: constants_1.QueueJob.ATTACHMENT_INDEX_CONTENT,
            data: { attachmentId: attachment.id },
            opts: {
                attempts: 1,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                deduplication: {
                    id: attachment.id,
                },
                removeOnComplete: true,
                removeOnFail: true,
            },
        }));
        try {
            await this.attachmentQueue.addBulk(jobs);
        }
        catch (err) {
            this.logger.error({ err }, `Failed to queue ${attachments.length} attachment for indexing`);
        }
        this.logger.debug(`Queued ${attachments.length} attachments for indexing`);
    }
    async triggerAttachmentsIndexing(workspaceId, delayMs) {
        try {
            const jobId = workspaceId
                ? `attachment-indexing-${workspaceId}`
                : 'attachment-indexing-all';
            await this.attachmentQueue.add(constants_1.QueueJob.ATTACHMENT_INDEXING, { workspaceId }, {
                jobId,
                delay: delayMs,
                attempts: 2,
                backoff: {
                    type: 'exponential',
                    delay: 5 * 60 * 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
                deduplication: {
                    id: jobId,
                },
            });
            this.logger.debug(`Enqueued attachment indexing job ${workspaceId ? `for workspace ${workspaceId}` : 'for all workspaces'}${delayMs ? ` with ${delayMs}ms delay` : ''}`);
        }
        catch (err) {
            this.logger.error({ err }, 'Failed to enqueue attachment indexing job');
            throw err;
        }
    }
    withPage(eb) {
        return (0, postgres_1.jsonObjectFrom)(eb
            .selectFrom('pages')
            .select(['pages.id', 'pages.title', 'pages.slugId', 'pages.icon'])
            .whereRef('pages.id', '=', 'attachments.pageId')).as('page');
    }
    withSpace(eb) {
        return (0, postgres_1.jsonObjectFrom)(eb
            .selectFrom('spaces')
            .select(['spaces.id', 'spaces.name', 'spaces.slug'])
            .whereRef('spaces.id', '=', 'attachments.spaceId')).as('space');
    }
    async convertPdfToMarkdown(fileBuffer) {
        const result = (0, pdf_inspector_1.processPdf)(fileBuffer);
        return result.markdown ?? '';
    }
    async convertDocxToText(fileBuffer) {
        let fullText = '';
        try {
            const { value } = await mammoth.extractRawText({
                buffer: fileBuffer,
            });
            fullText = value;
        }
        catch (err) {
            this.logger.error({ err }, 'Failed to extract DOCX text');
            throw err;
        }
        return fullText;
    }
};
exports.AttachmentEeService = AttachmentEeService;
exports.AttachmentEeService = AttachmentEeService = AttachmentEeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, nestjs_kysely_1.InjectKysely)()),
    __param(5, (0, bullmq_1.InjectQueue)(constants_1.QueueName.ATTACHMENT_QUEUE)),
    __metadata("design:paramtypes", [attachment_repo_1.AttachmentRepo,
        page_permission_repo_1.PagePermissionRepo,
        storage_service_1.StorageService, Object, space_member_repo_1.SpaceMemberRepo,
        bullmq_2.Queue])
], AttachmentEeService);
//# sourceMappingURL=attachment-ee.service.js.map