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
var PageSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageSearchService = void 0;
const common_1 = require("@nestjs/common");
const page_repo_1 = require("../../../database/repos/page/page.repo");
const page_permission_repo_1 = require("../../../database/repos/page/page-permission.repo");
const space_member_repo_1 = require("../../../database/repos/space/space-member.repo");
const share_repo_1 = require("../../../database/repos/share/share.repo");
const nestjs_kysely_1 = require("nestjs-kysely");
const typesense_service_1 = require("./typesense.service");
const constants_1 = require("../constants");
const page_schema_1 = require("../schemas/page.schema");
const typesense_util_1 = require("../typesense.util");
const constants_2 = require("../../../integrations/queue/constants");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const uuid_1 = require("uuid");
let PageSearchService = PageSearchService_1 = class PageSearchService {
    constructor(db, typesenseService, pageRepo, pagePermissionRepo, spaceMemberRepo, shareRepo, searchQueue) {
        this.db = db;
        this.typesenseService = typesenseService;
        this.pageRepo = pageRepo;
        this.pagePermissionRepo = pagePermissionRepo;
        this.spaceMemberRepo = spaceMemberRepo;
        this.shareRepo = shareRepo;
        this.searchQueue = searchQueue;
        this.logger = new common_1.Logger(PageSearchService_1.name);
    }
    async createPagesCollection() {
        const collectionExists = await this.typesenseService
            .getClient()
            .collections(constants_1.CollectionSchema.PAGE)
            .exists();
        if (collectionExists)
            return;
        await this.typesenseService.getClient().collections().create(page_schema_1.pageSchema);
    }
    async searchPage(searchParams, opts) {
        const { userId, workspaceId } = opts;
        const { query, spaceId, shareId, creatorId, limit, offset } = searchParams;
        if (query?.trim().length < 1) {
            return { items: [] };
        }
        let filterBy = `workspaceId:=${workspaceId}`;
        let pageIdsFilter = null;
        if (shareId && !spaceId && !userId) {
            const share = await this.shareRepo.findById(shareId);
            if (!share || share.workspaceId !== workspaceId) {
                return { items: [] };
            }
            const isRestricted = await this.pagePermissionRepo.hasRestrictedAncestor(share.pageId);
            if (isRestricted) {
                return { items: [] };
            }
            const pageIdsToSearch = [];
            if (share.includeSubPages) {
                const pageList = await this.pageRepo.getPageAndDescendantsExcludingRestricted(share.pageId, { includeContent: false });
                pageIdsToSearch.push(...pageList.map((page) => page.id));
            }
            else {
                pageIdsToSearch.push(share.pageId);
            }
            if (pageIdsToSearch.length === 0) {
                return { items: [] };
            }
            pageIdsFilter = pageIdsToSearch;
        }
        else if (spaceId) {
            filterBy += ` && spaceId:=${spaceId}`;
        }
        else if (userId) {
            const userSpaceIds = await this.spaceMemberRepo.getUserSpaceIds(userId);
            if (userSpaceIds.length === 0) {
                return { items: [] };
            }
            filterBy += ` && spaceId:=[${userSpaceIds.join(',')}]`;
        }
        else {
            return { items: [] };
        }
        if (pageIdsFilter) {
            filterBy += ` && id:=[${pageIdsFilter.join(',')}]`;
        }
        if (creatorId) {
            if (!(0, uuid_1.validate)(creatorId)) {
                return { items: [] };
            }
            filterBy += ` && creatorId:=${creatorId}`;
        }
        const searchParameters = {
            collection: 'pages',
            q: query,
            query_by: 'title,textContent',
            filter_by: filterBy,
            sort_by: '_text_match:desc',
            exclude_fields: 'textContent',
            per_page: limit || 25,
            offset,
            num_typos: 2,
            exhaustive_search: true,
            highlight_fields: 'textContent',
            highlight_affix_num_tokens: 15,
        };
        let result;
        try {
            const multiSearchResult = await this.typesenseService
                .getClient()
                .multiSearch.perform({ searches: [searchParameters] });
            result = multiSearchResult.results[0];
        }
        catch (err) {
            this.logger.error({ err }, 'Typesense search failed');
            throw new Error('Search service unavailable');
        }
        if (userId && result.hits?.length > 0) {
            const pageIds = result.hits.map((hit) => hit.document.id);
            const accessibleIds = await this.pagePermissionRepo.filterAccessiblePageIds({
                pageIds,
                userId,
            });
            const accessibleSet = new Set(accessibleIds);
            result.hits = result.hits.filter((hit) => accessibleSet.has(hit.document.id));
        }
        let spaceMap = new Map();
        if (!shareId) {
            const spaceIds = [
                ...new Set(result.hits?.map((hit) => hit.document.spaceId)),
            ].filter(Boolean);
            if (spaceIds.length > 0) {
                const spaces = await this.db
                    .selectFrom('spaces')
                    .select(['spaces.id', 'spaces.name', 'spaces.slug'])
                    .where('id', 'in', spaceIds)
                    .execute();
                spaceMap = new Map(spaces.map((space) => [space.id, space]));
            }
        }
        return { items: (0, typesense_util_1.transformSearchResults)(result, spaceMap) };
    }
    async indexAllPages(workspaceId) {
        let lastId = null;
        const chunkSize = 1000;
        let processedCount = 0;
        while (true) {
            const pages = await this.db
                .selectFrom('pages')
                .select([
                'id',
                'slugId',
                'title',
                'icon',
                'textContent',
                'parentPageId',
                'creatorId',
                'spaceId',
                'workspaceId',
                'createdAt',
                'updatedAt',
                'contributorIds',
            ])
                .$if(Boolean(workspaceId), (qb) => qb.where('workspaceId', '=', workspaceId))
                .where('deletedAt', 'is', null)
                .$if(Boolean(lastId), (qb) => qb.where('id', '>', lastId))
                .orderBy('id', 'asc')
                .limit(chunkSize)
                .execute();
            if (pages.length === 0)
                break;
            const documents = pages.map((page) => (0, typesense_util_1.transformPageToDocument)(page));
            await this.typesenseService
                .getClient()
                .collections(constants_1.CollectionSchema.PAGE)
                .documents()
                .import(pages.map(typesense_util_1.transformPageToDocument), { action: 'upsert' });
            lastId = pages[pages.length - 1].id;
            processedCount += documents.length;
            this.logger.debug(`Indexed ${processedCount} pages${workspaceId ? ` for workspace ${workspaceId}` : ''}`);
        }
        this.logger.debug(`Completed indexing ${processedCount} pages${workspaceId ? ` for workspace ${workspaceId}` : ''}`);
    }
    async triggerPageIndexing(workspaceId, delayMs) {
        try {
            const jobId = workspaceId
                ? `${constants_2.QueueJob.SEARCH_INDEX_PAGES}-${workspaceId}`
                : constants_2.QueueJob.SEARCH_INDEX_PAGES;
            await this.searchQueue.add(constants_2.QueueJob.SEARCH_INDEX_PAGES, { workspaceId }, {
                jobId,
                delay: delayMs,
                attempts: 2,
                backoff: {
                    type: 'exponential',
                    delay: 60 * 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
                deduplication: {
                    id: jobId,
                },
            });
            this.logger.debug(`Enqueued page indexing job ${workspaceId ? `for workspace ${workspaceId}` : 'for all workspaces'}${delayMs ? ` with ${delayMs}ms delay` : ''}`);
        }
        catch (err) {
            this.logger.error({ err }, 'Failed to enqueue attachment indexing job');
            throw err;
        }
    }
};
exports.PageSearchService = PageSearchService;
exports.PageSearchService = PageSearchService = PageSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(6, (0, bullmq_1.InjectQueue)(constants_2.QueueName.SEARCH_QUEUE)),
    __metadata("design:paramtypes", [Object, typesense_service_1.TypesenseService,
        page_repo_1.PageRepo,
        page_permission_repo_1.PagePermissionRepo,
        space_member_repo_1.SpaceMemberRepo,
        share_repo_1.ShareRepo,
        bullmq_2.Queue])
], PageSearchService);
//# sourceMappingURL=page-search.service.js.map