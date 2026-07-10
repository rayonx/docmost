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
exports.ScimTokenService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const uuid_1 = require("uuid");
const cursor_pagination_1 = require("../../../database/pagination/cursor-pagination");
const postgres_1 = require("kysely/helpers/postgres");
const scim_utils_1 = require("../scim.utils");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const audit_service_1 = require("../../../integrations/audit/audit.service");
const audit_events_1 = require("../../../common/events/audit-events");
let ScimTokenService = class ScimTokenService {
    constructor(db, environmentService, auditService) {
        this.db = db;
        this.environmentService = environmentService;
        this.auditService = auditService;
    }
    async createToken(user, workspaceId, name) {
        const rawToken = (0, scim_utils_1.generateRawScimToken)();
        const tokenHash = (0, scim_utils_1.hashScimToken)(rawToken, this.environmentService.getAppSecret());
        const tokenLastFour = rawToken.slice(-4);
        const scimToken = await this.db
            .insertInto('scimTokens')
            .values({
            id: (0, uuid_1.v7)(),
            name,
            tokenHash,
            tokenLastFour,
            creatorId: user.id,
            workspaceId,
        })
            .returningAll()
            .executeTakeFirst();
        this.auditService?.log({
            event: audit_events_1.AuditEvent.SCIM_TOKEN_CREATED,
            resourceType: audit_events_1.AuditResource.SCIM_TOKEN,
            resourceId: scimToken.id,
            changes: {
                after: {
                    name: scimToken.name,
                },
            },
        });
        return { token: rawToken, scimToken };
    }
    async getTokens(opts) {
        const { workspaceId, pagination } = opts;
        const query = this.db
            .selectFrom('scimTokens')
            .select([
            'id',
            'name',
            'tokenLastFour',
            'lastUsedAt',
            'isEnabled',
            'creatorId',
            'workspaceId',
            'createdAt',
            'updatedAt',
        ])
            .select((eb) => this.withCreator(eb))
            .where('workspaceId', '=', workspaceId)
            .where('deletedAt', 'is', null);
        return (0, cursor_pagination_1.executeWithCursorPagination)(query, {
            perPage: pagination.limit,
            cursor: pagination.cursor,
            beforeCursor: pagination.beforeCursor,
            fields: [{ expression: 'id', direction: 'desc' }],
            parseCursor: (cursor) => ({ id: cursor.id }),
        });
    }
    async findById(tokenId, workspaceId) {
        return this.db
            .selectFrom('scimTokens')
            .selectAll()
            .where('id', '=', tokenId)
            .where('workspaceId', '=', workspaceId)
            .where('deletedAt', 'is', null)
            .executeTakeFirst();
    }
    async revokeToken(tokenId, workspaceId) {
        const before = await this.findById(tokenId, workspaceId);
        await this.db
            .updateTable('scimTokens')
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where('id', '=', tokenId)
            .where('workspaceId', '=', workspaceId)
            .execute();
        if (before) {
            this.auditService?.log({
                event: audit_events_1.AuditEvent.SCIM_TOKEN_DELETED,
                resourceType: audit_events_1.AuditResource.SCIM_TOKEN,
                resourceId: tokenId,
                changes: {
                    before: {
                        name: before.name,
                        creatorId: before.creatorId,
                    },
                },
            });
        }
    }
    async validateBearerToken(bearerToken, workspaceId) {
        const tokenHash = (0, scim_utils_1.hashScimToken)(bearerToken, this.environmentService.getAppSecret());
        const scimToken = await this.db
            .selectFrom('scimTokens')
            .selectAll()
            .where('tokenHash', '=', tokenHash)
            .where('workspaceId', '=', workspaceId)
            .where('deletedAt', 'is', null)
            .executeTakeFirst();
        if (!scimToken) {
            (0, scim_utils_1.throwScimError)(401, 'Invalid SCIM token');
        }
        if (!scimToken.isEnabled) {
            (0, scim_utils_1.throwScimError)(401, 'SCIM token is disabled');
        }
        await this.updateLastUsedAt(scimToken.id);
        return scimToken;
    }
    async updateLastUsedAt(tokenId) {
        await this.db
            .updateTable('scimTokens')
            .set({ lastUsedAt: new Date() })
            .where('id', '=', tokenId)
            .execute();
    }
    withCreator(eb) {
        return (0, postgres_1.jsonObjectFrom)(eb
            .selectFrom('users')
            .select(['users.id', 'users.name', 'users.avatarUrl'])
            .whereRef('users.id', '=', 'scimTokens.creatorId')).as('creator');
    }
};
exports.ScimTokenService = ScimTokenService;
exports.ScimTokenService = ScimTokenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(2, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [Object, environment_service_1.EnvironmentService, Object])
], ScimTokenService);
//# sourceMappingURL=scim-token.service.js.map