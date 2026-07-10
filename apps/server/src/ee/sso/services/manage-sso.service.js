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
var ManageSsoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageSsoService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const cursor_pagination_1 = require("../../../database/pagination/cursor-pagination");
const constants_1 = require("../constants");
const utils_1 = require("../../../database/utils");
let ManageSsoService = ManageSsoService_1 = class ManageSsoService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(ManageSsoService_1.name);
        this.publicFields = [
            'id',
            'name',
            'type',
            'samlUrl',
            'samlCertificate',
            'oidcIssuer',
            'oidcClientId',
            'oidcClientSecret',
            'ldapUrl',
            'ldapBindDn',
            'ldapBindPassword',
            'ldapBaseDn',
            'ldapUserSearchFilter',
            'ldapUserAttributes',
            'ldapTlsEnabled',
            'ldapTlsCaCert',
            'allowSignup',
            'isEnabled',
            'groupSync',
            'creatorId',
            'workspaceId',
            'createdAt',
            'updatedAt',
        ];
    }
    async getProviders(workspace, pagination) {
        let query = this.db
            .selectFrom('authProviders')
            .select(this.publicFields)
            .where('workspaceId', '=', workspace.id);
        if (workspace.plan === 'standard') {
            query = query.where('type', '=', constants_1.SSO_PROVIDER.GOOGLE);
        }
        const result = await (0, cursor_pagination_1.executeWithCursorPagination)(query, {
            perPage: pagination.limit,
            cursor: pagination.cursor,
            beforeCursor: pagination.beforeCursor,
            fields: [{ expression: 'authProviders.id', direction: 'asc', key: 'id' }],
            parseCursor: (cursor) => ({ id: cursor.id }),
        });
        result.items = result.items.map((provider) => this.maskSensitiveFields(provider));
        return result;
    }
    async getProvider(providerId, workspaceId) {
        const provider = await this.db
            .selectFrom('authProviders')
            .select(this.publicFields)
            .where('id', '=', providerId)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
        if (!provider) {
            throw new common_1.NotFoundException('SSO provider not found.');
        }
        return this.maskSensitiveFields(provider);
    }
    async createProvider(dto, opts) {
        const { workspaceId, creatorId, trx } = opts;
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        if (dto.type === constants_1.SSO_PROVIDER.GOOGLE) {
            const googleProvider = await db
                .selectFrom('authProviders')
                .select(['id'])
                .where('type', '=', constants_1.SSO_PROVIDER.GOOGLE)
                .where('workspaceId', '=', workspaceId)
                .executeTakeFirst();
            if (googleProvider) {
                throw new common_1.BadRequestException('There can only be one Google provider in a workspace.');
            }
        }
        const values = {};
        if (dto.type === constants_1.SSO_PROVIDER.SAML) {
            values.samlUrl = dto.samlUrl;
            values.samlCertificate = dto.samlCertificate;
        }
        else if (dto.type === constants_1.SSO_PROVIDER.OIDC) {
            values.oidcIssuer = dto.oidcIssuer;
            values.oidcClientId = dto.oidcClientId;
            values.oidcClientSecret = dto.oidcClientSecret;
        }
        else if (dto.type === constants_1.SSO_PROVIDER.LDAP) {
            values.ldapUrl = dto.ldapUrl;
            values.ldapBindDn = dto.ldapBindDn;
            values.ldapBindPassword = dto.ldapBindPassword;
            values.ldapBaseDn = dto.ldapBaseDn;
            values.ldapUserSearchFilter = dto.ldapUserSearchFilter;
            values.ldapUserAttributes = dto.ldapUserAttributes;
            values.ldapTlsEnabled = dto.ldapTlsEnabled;
            values.ldapTlsCaCert = dto.ldapTlsCaCert;
        }
        const createdProvider = await db
            .insertInto('authProviders')
            .values({
            name: dto.name,
            type: dto.type,
            ...values,
            allowSignup: dto.allowSignup,
            isEnabled: dto.isEnabled,
            groupSync: dto.groupSync,
            creatorId: creatorId,
            workspaceId: workspaceId,
        })
            .returning(this.publicFields)
            .executeTakeFirst();
        return this.maskSensitiveFields(createdProvider);
    }
    async updateProvider(dto, workspaceId) {
        const provider = await this.db
            .selectFrom('authProviders')
            .select(['id', 'type'])
            .where('id', '=', dto.providerId)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
        if (!provider) {
            throw new common_1.NotFoundException('SSO provider not found.');
        }
        const values = {};
        if (provider.type === constants_1.SSO_PROVIDER.SAML) {
            values.samlUrl = dto.samlUrl;
            values.samlCertificate = dto.samlCertificate;
        }
        else if (provider.type === constants_1.SSO_PROVIDER.OIDC) {
            values.oidcIssuer = dto.oidcIssuer;
            values.oidcClientId = dto.oidcClientId;
            values.oidcClientSecret = dto.oidcClientSecret;
        }
        else if (provider.type === constants_1.SSO_PROVIDER.LDAP) {
            values.ldapUrl = dto.ldapUrl;
            values.ldapBindDn = dto.ldapBindDn;
            values.ldapBindPassword = dto.ldapBindPassword;
            values.ldapBaseDn = dto.ldapBaseDn;
            values.ldapUserSearchFilter = dto.ldapUserSearchFilter;
            values.ldapUserAttributes = dto.ldapUserAttributes;
            values.ldapTlsEnabled = dto.ldapTlsEnabled;
            values.ldapTlsCaCert = dto.ldapTlsCaCert;
        }
        const updatedProvider = await this.db
            .updateTable('authProviders')
            .set({
            name: dto.name,
            ...values,
            allowSignup: dto.allowSignup,
            isEnabled: dto.isEnabled,
            groupSync: dto.groupSync,
            updatedAt: new Date(),
        })
            .where('id', '=', provider.id)
            .returning(this.publicFields)
            .executeTakeFirst();
        return this.maskSensitiveFields(updatedProvider);
    }
    async deleteProvider(providerId, workspaceId) {
        const provider = await this.db
            .selectFrom('authProviders')
            .select(['id', 'type'])
            .where('id', '=', providerId)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
        if (!provider) {
            throw new common_1.NotFoundException('SSO provider not found.');
        }
        if (provider.type === constants_1.SSO_PROVIDER.GOOGLE) {
            throw new common_1.BadRequestException('You can not delete the default Google SSO provider.');
        }
        await this.db
            .deleteFrom('authProviders')
            .where('id', '=', providerId)
            .execute();
    }
    maskSensitiveFields(provider) {
        if (!provider)
            return provider;
        const masked = { ...provider };
        const sensitiveFieldsByType = {
            [constants_1.SSO_PROVIDER.LDAP]: ['ldapBindPassword'],
            [constants_1.SSO_PROVIDER.OIDC]: ['oidcClientSecret'],
        };
        const fieldsToMask = sensitiveFieldsByType[masked.type] || [];
        for (const field of fieldsToMask) {
            if (masked[field]) {
                masked[field] = '********';
            }
        }
        return masked;
    }
};
exports.ManageSsoService = ManageSsoService;
exports.ManageSsoService = ManageSsoService = ManageSsoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], ManageSsoService);
//# sourceMappingURL=manage-sso.service.js.map