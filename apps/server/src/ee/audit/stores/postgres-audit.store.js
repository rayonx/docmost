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
exports.PostgresAuditStore = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const cursor_pagination_1 = require("../../../database/pagination/cursor-pagination");
let PostgresAuditStore = class PostgresAuditStore {
    constructor(db) {
        this.db = db;
    }
    async insert(data) {
        await this.db
            .insertInto('audit')
            .values({
            workspaceId: data.workspaceId,
            actorId: data.actorId,
            actorType: data.actorType,
            event: data.event,
            resourceType: data.resourceType,
            resourceId: data.resourceId,
            spaceId: data.spaceId ?? null,
            changes: data.changes ?? null,
            metadata: data.metadata ?? null,
            ipAddress: data.ipAddress,
        })
            .execute();
    }
    async insertBatch(data) {
        if (data.length === 0)
            return;
        const values = data.map((item) => ({
            workspaceId: item.workspaceId,
            actorId: item.actorId,
            actorType: item.actorType,
            event: item.event,
            resourceType: item.resourceType,
            resourceId: item.resourceId,
            spaceId: item.spaceId ?? null,
            changes: item.changes ?? null,
            metadata: item.metadata ?? null,
            ipAddress: item.ipAddress,
            userAgent: item.userAgent,
        }));
        await this.db.insertInto('audit').values(values).execute();
    }
    async findByWorkspace(workspaceId, filters, pagination) {
        let query = this.db
            .selectFrom('audit')
            .select([
            'audit.id',
            'audit.workspaceId',
            'audit.actorId',
            'audit.actorType',
            'audit.event',
            'audit.resourceType',
            'audit.resourceId',
            'audit.spaceId',
            'audit.changes',
            'audit.metadata',
            'audit.ipAddress',
            'audit.createdAt',
        ])
            .where('audit.workspaceId', '=', workspaceId);
        if (filters.event) {
            query = query.where('audit.event', '=', filters.event);
        }
        if (filters.resourceType) {
            query = query.where('audit.resourceType', '=', filters.resourceType);
        }
        if (filters.resourceId) {
            query = query.where('audit.resourceId', '=', filters.resourceId);
        }
        if (filters.actorId) {
            query = query.where('audit.actorId', '=', filters.actorId);
        }
        if (filters.spaceId) {
            query = query.where('audit.spaceId', '=', filters.spaceId);
        }
        if (filters.startDate) {
            query = query.where('audit.createdAt', '>=', new Date(filters.startDate));
        }
        if (filters.endDate) {
            query = query.where('audit.createdAt', '<=', new Date(filters.endDate));
        }
        return (0, cursor_pagination_1.executeWithCursorPagination)(query, {
            perPage: pagination.limit,
            cursor: pagination.cursor,
            beforeCursor: pagination.beforeCursor,
            fields: [{ expression: 'audit.id', direction: 'desc', key: 'id' }],
            parseCursor: (cursor) => ({ id: cursor.id }),
        });
    }
    async deleteOlderThan(days, workspaceId) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const result = await this.db
            .deleteFrom('audit')
            .where('workspaceId', '=', workspaceId)
            .where('createdAt', '<', cutoffDate)
            .executeTakeFirst();
        return Number(result.numDeletedRows);
    }
};
exports.PostgresAuditStore = PostgresAuditStore;
exports.PostgresAuditStore = PostgresAuditStore = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], PostgresAuditStore);
//# sourceMappingURL=postgres-audit.store.js.map