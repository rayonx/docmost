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
exports.BasePageResolverService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const postgres_1 = require("kysely/helpers/postgres");
const page_permission_repo_1 = require("../../../database/repos/page/page-permission.repo");
const space_member_repo_1 = require("../../../database/repos/space/space-member.repo");
let BasePageResolverService = class BasePageResolverService {
    constructor(db, pagePermissionRepo, spaceMemberRepo) {
        this.db = db;
        this.pagePermissionRepo = pagePermissionRepo;
        this.spaceMemberRepo = spaceMemberRepo;
    }
    async resolvePages(pageIds, workspaceId, userId) {
        const unique = Array.from(new Set(pageIds));
        if (unique.length === 0)
            return [];
        const rows = await this.db
            .selectFrom('pages')
            .select([
            'pages.id',
            'pages.slugId',
            'pages.title',
            'pages.icon',
            'pages.spaceId',
        ])
            .select((eb) => (0, postgres_1.jsonObjectFrom)(eb
            .selectFrom('spaces')
            .select(['spaces.id', 'spaces.name', 'spaces.slug'])
            .whereRef('spaces.id', '=', 'pages.spaceId')).as('space'))
            .where('pages.id', 'in', unique)
            .where('pages.workspaceId', '=', workspaceId)
            .where('pages.deletedAt', 'is', null)
            .where('pages.spaceId', 'in', this.spaceMemberRepo.getUserSpaceIdsQuery(userId))
            .execute();
        if (rows.length === 0)
            return [];
        const accessible = await this.pagePermissionRepo.filterAccessiblePageIds({
            pageIds: rows.map((r) => r.id),
            userId,
        });
        const accessibleSet = new Set(accessible);
        return rows.filter((r) => accessibleSet.has(r.id));
    }
};
exports.BasePageResolverService = BasePageResolverService;
exports.BasePageResolverService = BasePageResolverService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, page_permission_repo_1.PagePermissionRepo,
        space_member_repo_1.SpaceMemberRepo])
], BasePageResolverService);
//# sourceMappingURL=base-page-resolver.service.js.map