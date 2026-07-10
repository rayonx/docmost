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
exports.ApiKeyService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const workspace_repo_1 = require("../../database/repos/workspace/workspace.repo");
const user_repo_1 = require("../../database/repos/user/user.repo");
const token_service_1 = require("../../core/auth/services/token.service");
const uuid_1 = require("uuid");
const cursor_pagination_1 = require("../../database/pagination/cursor-pagination");
const postgres_1 = require("kysely/helpers/postgres");
const audit_service_1 = require("../../integrations/audit/audit.service");
const helpers_1 = require("../../common/helpers");
const audit_events_1 = require("../../common/events/audit-events");
let ApiKeyService = class ApiKeyService {
    constructor(db, workspaceRepo, userRepo, tokenService, auditService) {
        this.db = db;
        this.workspaceRepo = workspaceRepo;
        this.userRepo = userRepo;
        this.tokenService = tokenService;
        this.auditService = auditService;
    }
    async createApiKey(user, workspaceId, createApiKeyDto) {
        if (createApiKeyDto.expiresAt) {
            const expirationDate = new Date(createApiKeyDto.expiresAt);
            if (expirationDate <= new Date()) {
                throw new common_1.BadRequestException('Expiration date must be in the future');
            }
        }
        const expiresIn = createApiKeyDto.expiresAt
            ? Math.floor((new Date(createApiKeyDto.expiresAt).getTime() - Date.now()) / 1000)
            : undefined;
        const apiKeyId = (0, uuid_1.v7)();
        let token;
        try {
            token = await this.tokenService.generateApiToken({
                apiKeyId,
                user,
                workspaceId,
                expiresIn,
            });
        }
        catch (err) {
            throw new common_1.BadRequestException('Failed to generate api token');
        }
        const apiKey = await this.db
            .insertInto('apiKeys')
            .values({
            id: apiKeyId,
            name: createApiKeyDto.name,
            creatorId: user.id,
            workspaceId,
            expiresAt: createApiKeyDto.expiresAt
                ? new Date(createApiKeyDto.expiresAt)
                : null,
        })
            .returningAll()
            .executeTakeFirst();
        this.auditService?.log({
            event: audit_events_1.AuditEvent.API_KEY_CREATED,
            resourceType: audit_events_1.AuditResource.API_KEY,
            resourceId: apiKey.id,
            changes: {
                after: {
                    name: apiKey.name,
                    expiresAt: apiKey.expiresAt,
                },
            },
        });
        return { token, ...apiKey };
    }
    async getApiKeys(opts) {
        const { userId, workspaceId, pagination } = opts;
        let query = this.db
            .selectFrom('apiKeys')
            .selectAll()
            .select((eb) => this.withCreator(eb))
            .where('workspaceId', '=', workspaceId);
        if (userId) {
            query = query.where('creatorId', '=', userId);
        }
        return (0, cursor_pagination_1.executeWithCursorPagination)(query, {
            perPage: pagination.limit,
            cursor: pagination.cursor,
            beforeCursor: pagination.beforeCursor,
            fields: [{ expression: 'id', direction: 'desc' }],
            parseCursor: (cursor) => ({ id: cursor.id }),
        });
    }
    async findById(apiKeyId) {
        return this.db
            .selectFrom('apiKeys')
            .selectAll()
            .where('id', '=', apiKeyId)
            .executeTakeFirst();
    }
    async updateApiKey(apiKeyId, name) {
        const before = await this.findById(apiKeyId);
        const result = await this.db
            .updateTable('apiKeys')
            .set({
            name,
            updatedAt: new Date(),
        })
            .where('id', '=', apiKeyId)
            .returningAll()
            .execute();
        if (before) {
            this.auditService?.log({
                event: audit_events_1.AuditEvent.API_KEY_UPDATED,
                resourceType: audit_events_1.AuditResource.API_KEY,
                resourceId: apiKeyId,
                changes: {
                    before: { name: before.name },
                    after: { name },
                },
            });
        }
        return result;
    }
    async updateLastUsedAt(apiKeyId) {
        await this.db
            .updateTable('apiKeys')
            .set({
            lastUsedAt: new Date(),
            updatedAt: new Date(),
        })
            .where('id', '=', apiKeyId)
            .execute();
    }
    async revokeApiKey(apiKeyId) {
        const apiKey = await this.findById(apiKeyId);
        await this.db.deleteFrom('apiKeys').where('id', '=', apiKeyId).execute();
        if (apiKey) {
            this.auditService?.log({
                event: audit_events_1.AuditEvent.API_KEY_DELETED,
                resourceType: audit_events_1.AuditResource.API_KEY,
                resourceId: apiKeyId,
                changes: {
                    before: {
                        name: apiKey.name,
                        creatorId: apiKey.creatorId,
                    },
                },
            });
        }
    }
    withCreator(eb) {
        return (0, postgres_1.jsonObjectFrom)(eb
            .selectFrom('users')
            .select(['users.id', 'users.name', 'users.avatarUrl'])
            .whereRef('users.id', '=', 'apiKeys.creatorId')).as('creator');
    }
    async validateApiKey(payload) {
        const apiKey = await this.db
            .selectFrom('apiKeys')
            .select(['id', 'creatorId', 'workspaceId', 'expiresAt'])
            .where('id', '=', payload.apiKeyId)
            .executeTakeFirst();
        const invalidKeyMsg = 'Invalid API key';
        if (!apiKey) {
            throw new common_1.UnauthorizedException(invalidKeyMsg);
        }
        const isExpired = apiKey?.expiresAt && new Date(apiKey.expiresAt) < new Date();
        const isInvalid = !apiKey || isExpired || apiKey.workspaceId !== payload.workspaceId;
        if (isInvalid) {
            throw new common_1.UnauthorizedException(invalidKeyMsg);
        }
        const workspace = await this.workspaceRepo.findById(payload.workspaceId);
        if (!workspace) {
            throw new common_1.UnauthorizedException(invalidKeyMsg);
        }
        const user = await this.userRepo.findById(payload.sub, payload.workspaceId);
        if (!user || (0, helpers_1.isUserDisabled)(user)) {
            throw new common_1.UnauthorizedException(invalidKeyMsg);
        }
        await this.updateLastUsedAt(payload.apiKeyId);
        return { user, workspace };
    }
};
exports.ApiKeyService = ApiKeyService;
exports.ApiKeyService = ApiKeyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(4, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [Object, workspace_repo_1.WorkspaceRepo,
        user_repo_1.UserRepo,
        token_service_1.TokenService, Object])
], ApiKeyService);
//# sourceMappingURL=api-key.service.js.map