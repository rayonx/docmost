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
exports.AuditQueryService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const audit_store_types_1 = require("../stores/audit-store.types");
let AuditQueryService = class AuditQueryService {
    constructor(auditStore, db) {
        this.auditStore = auditStore;
        this.db = db;
    }
    async findByWorkspace(workspaceId, filters, pagination) {
        const result = await this.auditStore.findByWorkspace(workspaceId, filters, pagination);
        await this.resolveActors(result.items);
        await this.resolveResources(result.items);
        return result;
    }
    async getRetention(workspaceId) {
        const workspace = await this.db
            .selectFrom('workspaces')
            .select('auditRetentionDays')
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        return workspace?.auditRetentionDays ?? 365;
    }
    async updateRetention(workspaceId, retentionDays) {
        await this.db
            .updateTable('workspaces')
            .set({ auditRetentionDays: retentionDays, updatedAt: new Date() })
            .where('id', '=', workspaceId)
            .execute();
    }
    async resolveActors(items) {
        const actorIds = new Set();
        for (const item of items) {
            if (item.actorId)
                actorIds.add(item.actorId);
        }
        if (actorIds.size === 0)
            return;
        const rows = await this.db
            .selectFrom('users')
            .select(['id', 'name', 'email', 'avatarUrl'])
            .where('id', 'in', [...actorIds])
            .execute();
        const actorMap = new Map(rows.map((r) => [r.id, { id: r.id, name: r.name, email: r.email, avatarUrl: r.avatarUrl }]));
        for (const item of items) {
            if (item.actorId) {
                item.actor = actorMap.get(item.actorId) ?? null;
            }
        }
    }
    async resolveResources(items) {
        const idsByType = new Map();
        for (const item of items) {
            if (!item.resourceId)
                continue;
            if (!idsByType.has(item.resourceType)) {
                idsByType.set(item.resourceType, new Set());
            }
            idsByType.get(item.resourceType).add(item.resourceId);
        }
        const resourceMap = new Map();
        const pageIds = idsByType.get('page');
        if (pageIds?.size) {
            const rows = await this.db
                .selectFrom('pages')
                .select(['id', 'title', 'slugId'])
                .where('id', 'in', [...pageIds])
                .execute();
            for (const row of rows) {
                resourceMap.set(row.id, { name: row.title, slugId: row.slugId });
            }
        }
        const spaceIds = idsByType.get('space');
        const spaceMemberIds = idsByType.get('space_member');
        const allSpaceIds = new Set([
            ...(spaceIds ?? []),
            ...(spaceMemberIds ?? []),
        ]);
        if (allSpaceIds.size) {
            const rows = await this.db
                .selectFrom('spaces')
                .select(['id', 'name', 'slug'])
                .where('id', 'in', [...allSpaceIds])
                .execute();
            for (const row of rows) {
                resourceMap.set(row.id, { name: row.name, slug: row.slug });
            }
        }
        const groupIds = idsByType.get('group');
        if (groupIds?.size) {
            const rows = await this.db
                .selectFrom('groups')
                .select(['id', 'name'])
                .where('id', 'in', [...groupIds])
                .execute();
            for (const row of rows) {
                resourceMap.set(row.id, { name: row.name });
            }
        }
        const userIds = idsByType.get('user');
        if (userIds?.size) {
            const rows = await this.db
                .selectFrom('users')
                .select(['id', 'name'])
                .where('id', 'in', [...userIds])
                .execute();
            for (const row of rows) {
                resourceMap.set(row.id, { name: row.name });
            }
        }
        for (const item of items) {
            const resolved = resourceMap.get(item.resourceId);
            if (resolved) {
                item.resource = { id: item.resourceId, ...resolved };
            }
        }
    }
};
exports.AuditQueryService = AuditQueryService;
exports.AuditQueryService = AuditQueryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(audit_store_types_1.AUDIT_STORE)),
    __param(1, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, Object])
], AuditQueryService);
//# sourceMappingURL=audit-query.service.js.map