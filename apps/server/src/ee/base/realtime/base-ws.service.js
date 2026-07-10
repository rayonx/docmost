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
var BaseWsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseWsService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const base_repo_1 = require("../repos/base.repo");
const user_repo_1 = require("../../../database/repos/user/user.repo");
const ws_utils_1 = require("../../../ws/ws.utils");
const base_presence_service_1 = require("./base-presence.service");
const page_access_service_1 = require("../../../core/page/page-access/page-access.service");
const baseSubscribeSchema = zod_1.z.object({
    operation: zod_1.z.literal('base:subscribe'),
    pageId: zod_1.z.uuid(),
});
const baseUnsubscribeSchema = zod_1.z.object({
    operation: zod_1.z.literal('base:unsubscribe'),
    pageId: zod_1.z.uuid(),
});
const basePresenceSchema = zod_1.z.object({
    operation: zod_1.z.literal('base:presence'),
    pageId: zod_1.z.uuid(),
    cellId: zod_1.z.string().max(200).optional().nullable(),
    selection: zod_1.z.unknown().optional(),
});
const basePresenceLeaveSchema = zod_1.z.object({
    operation: zod_1.z.literal('base:presence:leave'),
    pageId: zod_1.z.uuid(),
});
const inboundSchema = zod_1.z.union([
    baseSubscribeSchema,
    baseUnsubscribeSchema,
    basePresenceSchema,
    basePresenceLeaveSchema,
]);
let BaseWsService = BaseWsService_1 = class BaseWsService {
    constructor(baseRepo, userRepo, pageAccessService, presence) {
        this.baseRepo = baseRepo;
        this.userRepo = userRepo;
        this.pageAccessService = pageAccessService;
        this.presence = presence;
        this.logger = new common_1.Logger(BaseWsService_1.name);
        this.server = null;
    }
    setServer(server) {
        this.server = server;
    }
    isBaseEvent(data) {
        return (typeof data?.operation === 'string' && data.operation.startsWith('base:'));
    }
    async handleInbound(client, raw) {
        const parsed = inboundSchema.safeParse(raw);
        if (!parsed.success) {
            this.logger.debug(`Rejecting inbound base event: ${parsed.error.issues[0]?.message}`);
            return;
        }
        const data = parsed.data;
        switch (data.operation) {
            case 'base:subscribe':
                await this.subscribe(client, data.pageId);
                return;
            case 'base:unsubscribe':
                await this.unsubscribe(client, data.pageId);
                return;
            case 'base:presence':
                await this.handlePresence(client, data);
                return;
            case 'base:presence:leave':
                await this.handlePresenceLeave(client, data.pageId);
                return;
        }
    }
    emitToBase(pageId, payload) {
        if (!this.server)
            return;
        this.server.to((0, ws_utils_1.getBaseRoomName)(pageId)).emit('message', payload);
    }
    async handleDisconnect(client) {
        const userId = client.data?.userId;
        const subs = this.subscriptionsFor(client);
        if (!userId || subs.size === 0)
            return;
        for (const pageId of subs) {
            await this.presence.leave(pageId, userId);
            this.emitToBase(pageId, {
                operation: 'base:presence:leave',
                pageId,
                userId,
            });
        }
        subs.clear();
    }
    async subscribe(client, pageId) {
        const userId = client.data?.userId;
        const workspaceId = client.data?.workspaceId;
        if (!userId || !workspaceId) {
            client.emit('message', {
                operation: 'base:subscribe:error',
                pageId,
                reason: 'unauthenticated',
            });
            return;
        }
        const base = await this.baseRepo.findById(pageId);
        if (!base) {
            client.emit('message', {
                operation: 'base:subscribe:error',
                pageId,
                reason: 'not_found',
            });
            return;
        }
        const canRead = await this.canReadBase(userId, workspaceId, base);
        if (!canRead) {
            client.emit('message', {
                operation: 'base:subscribe:error',
                pageId,
                reason: 'forbidden',
            });
            return;
        }
        client.join((0, ws_utils_1.getBaseRoomName)(pageId));
        this.subscriptionsFor(client).add(pageId);
        client.emit('message', {
            operation: 'base:subscribed',
            pageId,
            schemaVersion: base.baseSchemaVersion ?? 0,
        });
        const snapshot = await this.presence.snapshot(pageId);
        client.emit('message', {
            operation: 'base:presence:snapshot',
            pageId,
            entries: snapshot,
        });
    }
    async unsubscribe(client, pageId) {
        const userId = client.data?.userId;
        if (!userId)
            return;
        client.leave((0, ws_utils_1.getBaseRoomName)(pageId));
        this.subscriptionsFor(client).delete(pageId);
        await this.presence.leave(pageId, userId);
        this.emitToBase(pageId, {
            operation: 'base:presence:leave',
            pageId,
            userId,
        });
    }
    async handlePresence(client, data) {
        const userId = client.data?.userId;
        if (!userId)
            return;
        if (!client.rooms.has((0, ws_utils_1.getBaseRoomName)(data.pageId)))
            return;
        const entry = {
            userId,
            cellId: data.cellId ?? null,
            selection: data.selection ?? null,
            ts: Date.now(),
        };
        await this.presence.setPresence(data.pageId, entry);
        this.emitToBase(data.pageId, {
            operation: 'base:presence',
            pageId: data.pageId,
            ...entry,
        });
    }
    async handlePresenceLeave(client, pageId) {
        const userId = client.data?.userId;
        if (!userId)
            return;
        await this.presence.leave(pageId, userId);
        this.emitToBase(pageId, {
            operation: 'base:presence:leave',
            pageId,
            userId,
        });
    }
    async canReadBase(userId, workspaceId, base) {
        const user = await this.userRepo.findById(userId, workspaceId);
        if (!user)
            return false;
        try {
            await this.pageAccessService.validateCanView(base, user);
            return true;
        }
        catch {
            return false;
        }
    }
    subscriptionsFor(client) {
        const existing = client.data.baseSubscriptions;
        if (existing)
            return existing;
        const fresh = new Set();
        client.data.baseSubscriptions = fresh;
        return fresh;
    }
};
exports.BaseWsService = BaseWsService;
exports.BaseWsService = BaseWsService = BaseWsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [base_repo_1.BaseRepo,
        user_repo_1.UserRepo,
        page_access_service_1.PageAccessService,
        base_presence_service_1.BasePresenceService])
], BaseWsService);
//# sourceMappingURL=base-ws.service.js.map