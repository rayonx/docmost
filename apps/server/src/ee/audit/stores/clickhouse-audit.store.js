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
var ClickHouseAuditStore_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseAuditStore = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@clickhouse/client");
const uuid_1 = require("uuid");
let ClickHouseAuditStore = ClickHouseAuditStore_1 = class ClickHouseAuditStore {
    constructor(client) {
        this.client = client;
        this.logger = new common_1.Logger(ClickHouseAuditStore_1.name);
    }
    async insert(data) {
        await this.client.insert({
            table: 'audit',
            values: [this.toRow(data)],
            format: 'JSONEachRow',
        });
    }
    async insertBatch(data) {
        if (data.length === 0)
            return;
        await this.client.insert({
            table: 'audit',
            values: data.map((d) => this.toRow(d)),
            format: 'JSONEachRow',
        });
    }
    async findByWorkspace(workspaceId, filters, pagination) {
        const conditions = ['workspace_id = {workspaceId:UUID}'];
        const params = { workspaceId };
        if (filters.event) {
            conditions.push('event = {event:String}');
            params.event = filters.event;
        }
        if (filters.resourceType) {
            conditions.push('resource_type = {resourceType:String}');
            params.resourceType = filters.resourceType;
        }
        if (filters.resourceId) {
            conditions.push('resource_id = {resourceId:UUID}');
            params.resourceId = filters.resourceId;
        }
        if (filters.actorId) {
            conditions.push('actor_id = {actorId:UUID}');
            params.actorId = filters.actorId;
        }
        if (filters.spaceId) {
            conditions.push('space_id = {spaceId:UUID}');
            params.spaceId = filters.spaceId;
        }
        if (filters.startDate) {
            conditions.push('created_at >= {startDate:DateTime64(3)}');
            params.startDate = new Date(filters.startDate)
                .toISOString()
                .replace('T', ' ')
                .replace('Z', '');
        }
        if (filters.endDate) {
            conditions.push('created_at <= {endDate:DateTime64(3)}');
            params.endDate = new Date(filters.endDate)
                .toISOString()
                .replace('T', ' ')
                .replace('Z', '');
        }
        const cursor = pagination.cursor
            ? this.decodeCursor(pagination.cursor)
            : null;
        const beforeCursor = pagination.beforeCursor
            ? this.decodeCursor(pagination.beforeCursor)
            : null;
        if (cursor) {
            conditions.push('(created_at, id) < ({cursorCreatedAt:DateTime64(3)}, {cursorId:UUID})');
            params.cursorCreatedAt = cursor.createdAt;
            params.cursorId = cursor.id;
        }
        if (beforeCursor) {
            conditions.push('(created_at, id) > ({beforeCursorCreatedAt:DateTime64(3)}, {beforeCursorId:UUID})');
            params.beforeCursorCreatedAt = beforeCursor.createdAt;
            params.beforeCursorId = beforeCursor.id;
        }
        const reversed = !!pagination.beforeCursor && !pagination.cursor;
        const orderDir = reversed ? 'ASC' : 'DESC';
        const limit = pagination.limit ?? 20;
        const query = `
      SELECT
        id, workspace_id, actor_id, actor_type,
        event, resource_type, resource_id, space_id,
        changes, metadata, ip_address, created_at
      FROM audit
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at ${orderDir}, id ${orderDir}
      LIMIT {fetchLimit:UInt32}
    `;
        params.fetchLimit = limit + 1;
        const result = await this.client.query({
            query,
            query_params: params,
            format: 'JSONEachRow',
        });
        const rawRows = await result.json();
        const hasNextPage = rawRows.length > limit;
        if (rawRows.length > limit)
            rawRows.pop();
        if (reversed)
            rawRows.reverse();
        const items = rawRows.map((row) => this.fromRow(row));
        const startRow = items[0];
        const endRow = items[items.length - 1];
        const hasPrevPage = !!pagination.cursor;
        const prevCursor = hasPrevPage && startRow
            ? this.encodeCursor(startRow.id, startRow.createdAt)
            : null;
        const nextCursor = hasNextPage && endRow
            ? this.encodeCursor(endRow.id, endRow.createdAt)
            : null;
        return {
            items,
            meta: {
                limit,
                hasNextPage,
                hasPrevPage,
                nextCursor,
                prevCursor,
            },
        };
    }
    async deleteOlderThan(days, workspaceId) {
        try {
            await this.client.command({
                query: `
          ALTER TABLE audit DELETE
          WHERE workspace_id = {workspaceId:UUID}
            AND created_at < now() - INTERVAL {days:UInt32} DAY
        `,
                query_params: { workspaceId, days },
            });
        }
        catch (err) {
            this.logger.error({ err }, 'ClickHouse audit cleanup mutation failed');
        }
        return 0;
    }
    toRow(data) {
        return {
            id: (0, uuid_1.v7)(),
            workspace_id: data.workspaceId,
            actor_id: data.actorId ?? null,
            actor_type: data.actorType,
            event: data.event,
            resource_type: data.resourceType,
            resource_id: data.resourceId ?? null,
            space_id: data.spaceId ?? null,
            changes: data.changes ? JSON.stringify(data.changes) : '',
            metadata: data.metadata ? JSON.stringify(data.metadata) : '',
            ip_address: data.ipAddress ?? null,
            created_at: new Date().toISOString().replace('T', ' ').replace('Z', ''),
        };
    }
    fromRow(row) {
        return {
            id: row.id,
            workspaceId: row.workspace_id,
            actorId: row.actor_id || null,
            actorType: row.actor_type,
            event: row.event,
            resourceType: row.resource_type,
            resourceId: row.resource_id || null,
            spaceId: row.space_id || null,
            changes: row.changes ? this.parseJson(row.changes) : null,
            metadata: row.metadata ? this.parseJson(row.metadata) : null,
            ipAddress: row.ip_address || null,
            createdAt: new Date(row.created_at),
        };
    }
    parseJson(str) {
        if (!str)
            return null;
        try {
            return JSON.parse(str);
        }
        catch {
            return null;
        }
    }
    encodeCursor(id, createdAt) {
        const params = new URLSearchParams();
        params.set('id', id);
        params.set('ca', createdAt.toISOString().replace('T', ' ').replace('Z', ''));
        return Buffer.from(params.toString(), 'utf8').toString('base64url');
    }
    decodeCursor(cursor) {
        const parsed = new URLSearchParams(Buffer.from(cursor, 'base64url').toString('utf8'));
        const id = parsed.get('id');
        const createdAt = parsed.get('ca');
        if (!id || !createdAt)
            throw new Error('Invalid cursor');
        return { id, createdAt };
    }
};
exports.ClickHouseAuditStore = ClickHouseAuditStore;
exports.ClickHouseAuditStore = ClickHouseAuditStore = ClickHouseAuditStore_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.ClickHouseClient])
], ClickHouseAuditStore);
//# sourceMappingURL=clickhouse-audit.store.js.map