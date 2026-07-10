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
exports.DocxExportService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const page_permission_repo_1 = require("../../database/repos/page/page-permission.repo");
const storage_service_1 = require("../../integrations/storage/storage.service");
const collaboration_util_1 = require("../../collaboration/collaboration.util");
const utils_1 = require("../../common/helpers/prosemirror/utils");
const editor_ext_1 = require("@docmost/editor-ext");
function parseAttachmentIdFromSrc(src) {
    const match = src?.match(/\/files\/([^/]+)\//);
    return match?.[1];
}
let DocxExportService = class DocxExportService {
    constructor(pagePermissionRepo, db, storageService) {
        this.pagePermissionRepo = pagePermissionRepo;
        this.db = db;
        this.storageService = storageService;
    }
    async exportPageToDocx(page, userId) {
        const json = (0, utils_1.getProsemirrorContent)(page.content);
        if (page.title) {
            json.content.unshift({
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: page.title }],
            });
        }
        const attachmentPaths = await this.resolveAccessibleAttachmentPaths(json, page, userId);
        const doc = (0, collaboration_util_1.jsonToNode)(json);
        return (0, editor_ext_1.pageNodeToDocxBuffer)(doc, async (src) => {
            const attachmentId = parseAttachmentIdFromSrc(src);
            const filePath = attachmentId
                ? attachmentPaths.get(attachmentId)
                : undefined;
            if (!filePath)
                return new Uint8Array();
            try {
                const fileBuffer = await this.storageService.read(filePath);
                return new Uint8Array(fileBuffer);
            }
            catch {
                return new Uint8Array();
            }
        });
    }
    async resolveAccessibleAttachmentPaths(json, page, userId) {
        const ids = (0, utils_1.getAttachmentIds)(json);
        if (ids.length === 0)
            return new Map();
        const rows = await this.db
            .selectFrom('attachments')
            .select(['id', 'filePath', 'pageId'])
            .where('id', 'in', ids)
            .where('spaceId', '=', page.spaceId)
            .execute();
        const ownerPageIds = [
            ...new Set(rows.map((r) => r.pageId).filter((id) => !!id)),
        ];
        const accessible = ownerPageIds.length
            ? await this.pagePermissionRepo.filterAccessiblePageIds({
                pageIds: ownerPageIds,
                userId,
                spaceId: page.spaceId,
            })
            : [];
        const accessibleSet = new Set(accessible);
        const map = new Map();
        for (const row of rows) {
            if (row.pageId && accessibleSet.has(row.pageId)) {
                map.set(row.id, row.filePath);
            }
        }
        return map;
    }
};
exports.DocxExportService = DocxExportService;
exports.DocxExportService = DocxExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [page_permission_repo_1.PagePermissionRepo, Object, storage_service_1.StorageService])
], DocxExportService);
//# sourceMappingURL=docx-export.service.js.map