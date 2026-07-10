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
exports.PageVerificationRepo = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const kysely_1 = require("kysely");
const cursor_pagination_1 = require("../../database/pagination/cursor-pagination");
const space_member_repo_1 = require("../../database/repos/space/space-member.repo");
const page_permission_repo_1 = require("../../database/repos/page/page-permission.repo");
let PageVerificationRepo = class PageVerificationRepo {
    constructor(db, spaceMemberRepo, pagePermissionRepo) {
        this.db = db;
        this.spaceMemberRepo = spaceMemberRepo;
        this.pagePermissionRepo = pagePermissionRepo;
    }
    async findByPageId(pageId, workspaceId) {
        const verification = await this.db
            .selectFrom('pageVerifications')
            .selectAll()
            .where('pageId', '=', pageId)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
        if (!verification)
            return null;
        const verifiers = await this.db
            .selectFrom('pageVerifiers')
            .innerJoin('users', 'users.id', 'pageVerifiers.userId')
            .select([
            'pageVerifiers.id',
            'pageVerifiers.userId',
            'pageVerifiers.createdAt',
            'users.name',
            'users.avatarUrl',
            'users.email',
        ])
            .where('pageVerifiers.pageVerificationId', '=', verification.id)
            .orderBy('pageVerifiers.createdAt', 'asc')
            .execute();
        return { ...verification, verifiers };
    }
    async findById(verificationId) {
        const verification = await this.db
            .selectFrom('pageVerifications')
            .selectAll()
            .where('id', '=', verificationId)
            .executeTakeFirst();
        if (!verification)
            return null;
        const verifiers = await this.db
            .selectFrom('pageVerifiers')
            .innerJoin('users', 'users.id', 'pageVerifiers.userId')
            .select([
            'pageVerifiers.id',
            'pageVerifiers.userId',
            'pageVerifiers.createdAt',
            'users.name',
            'users.avatarUrl',
            'users.email',
        ])
            .where('pageVerifiers.pageVerificationId', '=', verification.id)
            .orderBy('pageVerifiers.createdAt', 'asc')
            .execute();
        return { ...verification, verifiers };
    }
    async findAllWithExpiry() {
        const rows = await this.db
            .selectFrom('pageVerifications')
            .select(['id', 'expiresAt'])
            .where('expiresAt', 'is not', null)
            .execute();
        return rows.map((r) => ({ id: r.id, expiresAt: r.expiresAt }));
    }
    async insertVerification(data, trx) {
        const db = trx ?? this.db;
        return db
            .insertInto('pageVerifications')
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async insertVerifiers(verifiers, trx) {
        const db = trx ?? this.db;
        return db
            .insertInto('pageVerifiers')
            .values(verifiers)
            .returningAll()
            .execute();
    }
    async updateVerification(id, data, trx) {
        const db = trx ?? this.db;
        return db
            .updateTable('pageVerifications')
            .set(data)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async deleteByPageId(pageId) {
        return this.db
            .deleteFrom('pageVerifications')
            .where('pageId', '=', pageId)
            .execute();
    }
    async deleteVerifiersByVerificationId(verificationId, trx) {
        const db = trx ?? this.db;
        return db
            .deleteFrom('pageVerifiers')
            .where('pageVerificationId', '=', verificationId)
            .execute();
    }
    async findByWorkspace(userId, workspaceId, filters, pagination) {
        let query = this.db
            .selectFrom('pageVerifications')
            .innerJoin('pages', 'pages.id', 'pageVerifications.pageId')
            .innerJoin('spaces', 'spaces.id', 'pageVerifications.spaceId')
            .select([
            'pageVerifications.id',
            'pageVerifications.pageId',
            'pageVerifications.spaceId',
            'pageVerifications.type',
            'pageVerifications.status',
            'pageVerifications.mode',
            'pageVerifications.periodAmount',
            'pageVerifications.periodUnit',
            'pageVerifications.verifiedAt',
            'pageVerifications.expiresAt',
            'pageVerifications.createdAt',
            'pages.title as pageTitle',
            'pages.slugId as pageSlugId',
            'pages.icon as pageIcon',
            'spaces.name as spaceName',
            'spaces.slug as spaceSlug',
        ])
            .where('pageVerifications.workspaceId', '=', workspaceId)
            .where('pageVerifications.spaceId', 'in', this.spaceMemberRepo.getUserSpaceIdsQuery(userId));
        if (filters.spaceIds && filters.spaceIds.length > 0) {
            query = query.where('pageVerifications.spaceId', 'in', filters.spaceIds);
        }
        if (filters.type) {
            query = query.where('pageVerifications.type', '=', filters.type);
        }
        if (filters.verifierId) {
            query = query.where('pageVerifications.id', 'in', this.db
                .selectFrom('pageVerifiers')
                .select('pageVerificationId')
                .where('userId', '=', filters.verifierId));
        }
        if (pagination.query) {
            query = query.where((eb) => eb((0, kysely_1.sql) `f_unaccent(pages.title)`, 'ilike', (0, kysely_1.sql) `f_unaccent(${'%' + pagination.query + '%'})`));
        }
        const result = await (0, cursor_pagination_1.executeWithCursorPagination)(query, {
            perPage: pagination.limit,
            cursor: pagination.cursor,
            beforeCursor: pagination.beforeCursor,
            fields: [
                {
                    expression: 'pageVerifications.id',
                    direction: 'desc',
                    key: 'id',
                },
            ],
            parseCursor: (cursor) => ({
                id: cursor.id,
            }),
        });
        if (result.items.length > 0) {
            const pageIds = result.items.map((item) => item.pageId);
            const accessibleIds = await this.pagePermissionRepo.filterAccessiblePageIds({
                pageIds,
                userId,
            });
            const accessibleSet = new Set(accessibleIds);
            result.items = result.items.filter((item) => accessibleSet.has(item.pageId));
        }
        const verificationIds = result.items.map((item) => item.id);
        if (verificationIds.length === 0) {
            return { ...result, items: result.items.map((item) => ({ ...item, verifiers: [] })) };
        }
        const allVerifiers = await this.db
            .selectFrom('pageVerifiers')
            .innerJoin('users', 'users.id', 'pageVerifiers.userId')
            .select([
            'pageVerifiers.pageVerificationId',
            'pageVerifiers.userId',
            'users.name',
            'users.avatarUrl',
        ])
            .where('pageVerifiers.pageVerificationId', 'in', verificationIds)
            .orderBy('pageVerifiers.createdAt', 'asc')
            .execute();
        const verifiersByVerificationId = new Map();
        for (const verifier of allVerifiers) {
            const list = verifiersByVerificationId.get(verifier.pageVerificationId) ?? [];
            list.push(verifier);
            verifiersByVerificationId.set(verifier.pageVerificationId, list);
        }
        return {
            ...result,
            items: result.items.map((item) => ({
                ...item,
                verifiers: verifiersByVerificationId.get(item.id) ?? [],
            })),
        };
    }
};
exports.PageVerificationRepo = PageVerificationRepo;
exports.PageVerificationRepo = PageVerificationRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, space_member_repo_1.SpaceMemberRepo,
        page_permission_repo_1.PagePermissionRepo])
], PageVerificationRepo);
//# sourceMappingURL=page-verification.repo.js.map