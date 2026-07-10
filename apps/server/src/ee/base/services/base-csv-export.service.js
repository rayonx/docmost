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
var BaseCsvExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCsvExportService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const base_repo_1 = require("../repos/base.repo");
const base_property_repo_1 = require("../repos/base-property.repo");
const base_row_repo_1 = require("../repos/base-row.repo");
const csv_stringify_1 = require("csv-stringify");
const node_stream_1 = require("node:stream");
const base_schemas_1 = require("../base.schemas");
const cell_csv_serializer_1 = require("../export/cell-csv-serializer");
const csv_format_1 = require("../property-types/csv-format");
const reference_context_loader_1 = require("../reference/reference-context.loader");
const base_page_resolver_service_1 = require("./base-page-resolver.service");
const helpers_1 = require("../../../common/helpers");
const CHUNK_SIZE = 1000;
let BaseCsvExportService = BaseCsvExportService_1 = class BaseCsvExportService {
    constructor(db, baseRepo, basePropertyRepo, baseRowRepo, basePageResolverService) {
        this.db = db;
        this.baseRepo = baseRepo;
        this.basePropertyRepo = basePropertyRepo;
        this.baseRowRepo = baseRowRepo;
        this.basePageResolverService = basePageResolverService;
        this.logger = new common_1.Logger(BaseCsvExportService_1.name);
    }
    async streamBaseAsCsv(pageId, workspaceId, userId, reply) {
        const base = await this.baseRepo.findById(pageId);
        if (!base || base.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Base not found');
        }
        const properties = await this.basePropertyRepo.findByPageId(pageId);
        const fileName = (0, helpers_1.sanitizeFileName)(base.title || 'base') + '.csv';
        const stringifier = (0, csv_stringify_1.stringify)({
            header: true,
            columns: properties.map((p) => ({
                key: p.id,
                header: (0, csv_format_1.neutralizeCsvFormula)(p.name),
            })),
        });
        const out = new node_stream_1.PassThrough();
        out.write('\ufeff');
        stringifier.on('error', (err) => {
            this.logger.error('csv stringifier error', err);
            out.destroy(err);
        });
        stringifier.pipe(out);
        const asciiFallback = fileName.replace(/[^\x20-\x7e]/g, '_');
        reply.headers({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        });
        reply.send(out);
        let aborted = false;
        out.once('close', () => {
            aborted = true;
        });
        try {
            for await (const chunk of this.baseRowRepo.streamByPageId(pageId, {
                workspaceId,
                chunkSize: CHUNK_SIZE,
            })) {
                if (aborted)
                    break;
                const ctx = await this.buildCtx(chunk, properties, workspaceId, userId);
                for (const row of chunk) {
                    if (aborted)
                        break;
                    const record = {};
                    const cells = (row.cells ?? {});
                    for (const prop of properties) {
                        const type = prop.type;
                        let value;
                        if (type === base_schemas_1.BasePropertyType.CREATED_AT) {
                            value = row.createdAt;
                        }
                        else if (type === base_schemas_1.BasePropertyType.LAST_EDITED_AT) {
                            value = row.updatedAt;
                        }
                        else if (type === base_schemas_1.BasePropertyType.LAST_EDITED_BY) {
                            value = row.lastUpdatedById;
                        }
                        else {
                            value = cells[prop.id];
                        }
                        record[prop.id] = (0, cell_csv_serializer_1.serializeCellForCsv)(prop, value, ctx);
                    }
                    if (!stringifier.write(record)) {
                        await new Promise((resolve) => stringifier.once('drain', resolve));
                    }
                }
            }
            stringifier.end();
        }
        catch (err) {
            this.logger.error(`csv export failed base=${pageId}`, err);
            stringifier.destroy(err);
        }
    }
    async buildCtx(chunk, properties, workspaceId, userId) {
        const userIds = new Set();
        const pageIds = new Set();
        const needsUsers = properties.some((p) => p.type === base_schemas_1.BasePropertyType.PERSON ||
            p.type === base_schemas_1.BasePropertyType.LAST_EDITED_BY);
        if (needsUsers) {
            const personPropIds = properties
                .filter((p) => p.type === base_schemas_1.BasePropertyType.PERSON)
                .map((p) => p.id);
            for (const row of chunk) {
                if (row.lastUpdatedById)
                    userIds.add(row.lastUpdatedById);
                const cells = (row.cells ?? {});
                for (const pid of personPropIds) {
                    const v = cells[pid];
                    if (typeof v === 'string')
                        userIds.add(v);
                    else if (Array.isArray(v)) {
                        for (const id of v)
                            if (typeof id === 'string')
                                userIds.add(id);
                    }
                }
            }
        }
        const pagePropIds = properties
            .filter((p) => p.type === base_schemas_1.BasePropertyType.PAGE)
            .map((p) => p.id);
        if (pagePropIds.length > 0) {
            for (const row of chunk) {
                const cells = (row.cells ?? {});
                for (const pid of pagePropIds) {
                    const v = cells[pid];
                    if (typeof v === 'string' && v.length > 0)
                        pageIds.add(v);
                }
            }
        }
        const ctx = await (0, reference_context_loader_1.loadReferenceMaps)(this.db, { userIds }, workspaceId);
        if (pageIds.size > 0) {
            const pages = await this.basePageResolverService.resolvePages(Array.from(pageIds), workspaceId, userId);
            ctx.pageTitles = new Map(pages.map((p) => [p.id, p.title ?? '']));
        }
        return ctx;
    }
};
exports.BaseCsvExportService = BaseCsvExportService;
exports.BaseCsvExportService = BaseCsvExportService = BaseCsvExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, base_repo_1.BaseRepo,
        base_property_repo_1.BasePropertyRepo,
        base_row_repo_1.BaseRowRepo,
        base_page_resolver_service_1.BasePageResolverService])
], BaseCsvExportService);
//# sourceMappingURL=base-csv-export.service.js.map