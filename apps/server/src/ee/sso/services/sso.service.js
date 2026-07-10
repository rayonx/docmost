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
var SsoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SsoService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const domain_service_1 = require("../../../integrations/environment/domain.service");
const constants_1 = require("../constants");
const sso_utils_1 = require("../sso.utils");
const sso_constants_1 = require("../sso.constants");
const user_repo_1 = require("../../../database/repos/user/user.repo");
const group_user_repo_1 = require("../../../database/repos/group/group-user.repo");
const utils_1 = require("../../../database/utils");
const kysely_1 = require("kysely");
const date_fns_1 = require("date-fns");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const constants_2 = require("../../../integrations/queue/constants");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const auth_util_1 = require("../../../core/auth/auth.util");
const workspace_util_1 = require("../../../core/workspace/workspace.util");
const audit_events_1 = require("../../../common/events/audit-events");
const audit_service_1 = require("../../../integrations/audit/audit.service");
let SsoService = SsoService_1 = class SsoService {
    constructor(domainService, userRepo, groupUserRepo, environmentService, db, billingQueue, auditService) {
        this.domainService = domainService;
        this.userRepo = userRepo;
        this.groupUserRepo = groupUserRepo;
        this.environmentService = environmentService;
        this.db = db;
        this.billingQueue = billingQueue;
        this.auditService = auditService;
        this.logger = new common_1.Logger(SsoService_1.name);
    }
    async handleAuthentication({ workspace, providerId, providerType, profile, }) {
        const provider = await this.getProviderById({
            providerId,
            type: providerType,
            workspaceId: workspace.id,
        });
        if (!provider) {
            throw new common_1.NotFoundException(`${providerType.toUpperCase()} provider not found.`);
        }
        if (!provider.isEnabled) {
            throw new common_1.BadRequestException(`${provider.name} provider is not enabled.`);
        }
        let providerUserId;
        if (provider.type === constants_1.SSO_PROVIDER.SAML) {
            providerUserId = profile?.['nameId'];
        }
        else {
            if (provider.type === constants_1.SSO_PROVIDER.LDAP) {
                providerUserId = profile?.['uid'];
            }
            else {
                providerUserId = profile?.['sub'];
            }
        }
        let user = await this.userRepo.findByEmail(profile.email, workspace.id);
        let isNewUser = false;
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            if (!user) {
                const existingAuthAccount = await trx
                    .selectFrom('authAccounts')
                    .selectAll()
                    .where('providerUserId', '=', providerUserId)
                    .where('authProviderId', '=', providerId)
                    .executeTakeFirst();
                if (existingAuthAccount) {
                    user = await this.userRepo.findById(existingAuthAccount.userId, workspace.id, { trx });
                    if (!user) {
                        this.logger.error(`Auth account exists for providerUserId "${providerUserId}" but no user was found.`);
                        throw new common_1.BadRequestException('User not found for auth account.');
                    }
                }
            }
            if (user && user.deactivatedAt) {
                throw new common_1.ForbiddenException('Your account has been deactivated');
            }
            if (!user) {
                const invitation = await this.getInvitation(profile.email, workspace.id, trx);
                if (!provider.allowSignup && !invitation) {
                    throw new common_1.BadRequestException('User provisioning is disabled for this provider.');
                }
                (0, auth_util_1.validateAllowedEmail)(profile.email, workspace);
                user = await this.userRepo.insertUser({
                    name: profile.name,
                    email: profile.email,
                    emailVerifiedAt: new Date(),
                    password: (0, sso_utils_1.generateRandomPassword)(),
                    hasGeneratedPassword: true,
                    role: invitation?.role ?? workspace.defaultRole,
                    workspaceId: workspace.id,
                    lastLoginAt: new Date(),
                }, trx, { pageEditMode: (0, workspace_util_1.getWorkspaceDefaultPageEditMode)(workspace) });
                await this.groupUserRepo.addUserToDefaultGroup(user.id, workspace.id, trx);
                if (invitation?.groupIds?.length > 0) {
                    const validGroups = await trx
                        .selectFrom('groups')
                        .select(['id'])
                        .where('id', 'in', invitation.groupIds)
                        .where('workspaceId', '=', workspace.id)
                        .execute();
                    if (validGroups.length > 0) {
                        await trx
                            .insertInto('groupUsers')
                            .values(validGroups.map((g) => ({ userId: user.id, groupId: g.id })))
                            .onConflict((oc) => oc.columns(['userId', 'groupId']).doNothing())
                            .execute();
                    }
                }
                isNewUser = true;
                await this.clearInvitations({
                    email: user.email,
                    workspaceId: workspace.id,
                    trx,
                });
            }
            if (!user) {
                throw new common_1.NotFoundException('Authentication failed. User not found');
            }
            const authAccount = await trx
                .selectFrom('authAccounts')
                .select(['id', 'providerUserId'])
                .where('userId', '=', user.id)
                .where('authProviderId', '=', providerId)
                .executeTakeFirst();
            if (!authAccount) {
                await trx
                    .insertInto('authAccounts')
                    .values({
                    userId: user.id,
                    providerUserId: providerUserId,
                    authProviderId: providerId,
                    workspaceId: workspace.id,
                })
                    .execute();
            }
            else {
                if (provider.type === constants_1.SSO_PROVIDER.OIDC ||
                    provider.type === constants_1.SSO_PROVIDER.GOOGLE) {
                    if (authAccount.providerUserId !== profile?.['sub']) {
                        this.logger.warn(`${provider.type.toUpperCase()} sub for user ${user.id} does not match.`);
                        throw new common_1.BadRequestException('User SSO identity does not match.');
                    }
                }
                else if (provider.type === constants_1.SSO_PROVIDER.SAML) {
                    if (authAccount.providerUserId !== profile?.['nameId']) {
                        this.logger.warn(`SAML nameId for user ${user.id} does not match.`);
                        throw new common_1.BadRequestException('User SSO identity does not match.');
                    }
                }
                else if (provider.type === constants_1.SSO_PROVIDER.LDAP) {
                    if (authAccount.providerUserId !== profile?.['uid']) {
                        this.logger.warn(`LDAP uid for user ${user.id} does not match.`);
                        throw new common_1.BadRequestException('User SSO identity does not match.');
                    }
                }
                else {
                    throw new common_1.BadRequestException('Invalid authentication provider');
                }
            }
            await this.syncUserData({
                profile,
                user,
                isNewUser,
                workspaceId: workspace.id,
                trx,
            });
            if (provider.groupSync && provider.type !== constants_1.SSO_PROVIDER.GOOGLE) {
                if (workspace.isScimEnabled) {
                    this.logger.debug(`Skipping SSO group sync for user ${user.id} - SCIM is enabled`);
                }
                else {
                    const profileGroups = profile.groups;
                    if (profileGroups && profileGroups.length > 0) {
                        await this.syncUserGroups(user, profileGroups, workspace.id, trx);
                    }
                }
            }
        });
        if (this.environmentService.isCloud() && isNewUser) {
            await this.billingQueue.add(constants_2.QueueJob.STRIPE_SEATS_SYNC, {
                workspaceId: workspace.id,
            });
        }
        const auditContext = {
            workspaceId: workspace.id,
            actorId: user.id,
        };
        if (isNewUser) {
            this.auditService.logWithContext({
                event: audit_events_1.AuditEvent.USER_CREATED,
                resourceType: audit_events_1.AuditResource.USER,
                resourceId: user.id,
                changes: {
                    after: {
                        name: profile.name,
                        email: profile.email,
                        role: user.role,
                    },
                },
                metadata: {
                    source: 'sso',
                    providerType,
                    providerId,
                },
            }, auditContext);
        }
        this.auditService.logWithContext({
            event: audit_events_1.AuditEvent.USER_LOGIN,
            resourceType: audit_events_1.AuditResource.USER,
            resourceId: user.id,
            metadata: {
                source: 'sso',
                providerType,
                providerId,
            },
        }, auditContext);
        user.name = profile.name;
        user.email = profile.email;
        return user;
    }
    async syncUserData(opts) {
        const { profile, user, isNewUser, workspaceId, trx } = opts;
        const name = profile.name !== user.name ? profile.name : undefined;
        const email = profile.email !== user.email ? profile.email : undefined;
        if (name || email) {
            await this.userRepo.updateUser({ name, email, lastLoginAt: !isNewUser ? new Date() : undefined }, user.id, workspaceId, trx);
        }
        if (!isNewUser) {
            await this.userRepo.updateUser({ lastLoginAt: new Date() }, user.id, workspaceId, trx);
        }
    }
    async syncUserGroups(user, ssoGroups, workspaceId, trx) {
        try {
            const existingGroups = await trx
                .selectFrom('groups')
                .selectAll()
                .where('workspaceId', '=', workspaceId)
                .where('deletedAt', 'is', null)
                .execute();
            const groupMap = new Map(existingGroups.map((g) => [g.name.toLowerCase(), g]));
            const groupsToSync = [];
            const groupIdsToMarkExternal = [];
            for (const ssoGroupName of ssoGroups) {
                const existingGroup = groupMap.get(ssoGroupName.toLowerCase());
                if (existingGroup) {
                    groupsToSync.push(existingGroup);
                    if (!existingGroup.isExternal) {
                        groupIdsToMarkExternal.push(existingGroup.id);
                    }
                    this.logger.debug(`Mapping user to existing group "${existingGroup.name}"`);
                }
            }
            if (groupIdsToMarkExternal.length > 0) {
                await trx
                    .updateTable('groups')
                    .set({ isExternal: true, updatedAt: new Date() })
                    .where('id', 'in', groupIdsToMarkExternal)
                    .execute();
            }
            const currentGroups = await trx
                .selectFrom('groupUsers')
                .innerJoin('groups', 'groups.id', 'groupUsers.groupId')
                .select(['groups.id', 'groups.name', 'groups.isDefault'])
                .where('groupUsers.userId', '=', user.id)
                .where('groups.isDefault', '=', false)
                .where('groups.isExternal', '=', true)
                .execute();
            const currentGroupIds = new Set(currentGroups.map((g) => g.id));
            const newGroupIds = new Set(groupsToSync.map((g) => g.id));
            const groupsToRemove = currentGroups
                .filter((g) => !newGroupIds.has(g.id))
                .map((g) => g.id);
            if (groupsToRemove.length > 0) {
                await trx
                    .deleteFrom('groupUsers')
                    .where('userId', '=', user.id)
                    .where('groupId', 'in', groupsToRemove)
                    .execute();
                this.logger.debug(`Removed user ${user.id} from ${groupsToRemove.length} groups`);
            }
            const groupsToAdd = groupsToSync
                .filter((g) => !currentGroupIds.has(g.id))
                .map((g) => ({ userId: user.id, groupId: g.id }));
            if (groupsToAdd.length > 0) {
                await trx
                    .insertInto('groupUsers')
                    .values(groupsToAdd)
                    .onConflict((oc) => oc.columns(['userId', 'groupId']).doNothing())
                    .execute();
                this.logger.debug(`Added user ${user.id} to ${groupsToAdd.length} groups`);
            }
        }
        catch (err) {
            this.logger.error({ err }, `Failed to sync groups for user ${user.id}`);
        }
    }
    async getInvitation(email, workspaceId, trx) {
        return trx
            .selectFrom('workspaceInvitations')
            .select(['id', 'role', 'groupIds'])
            .where((0, kysely_1.sql) `LOWER(email)`, '=', email.toLowerCase())
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
    }
    async hasInvitation(email, workspaceId, trx) {
        return !!(await this.getInvitation(email, workspaceId, trx));
    }
    async clearInvitations(opts) {
        const { email, workspaceId, trx } = opts;
        await trx
            .deleteFrom('workspaceInvitations')
            .where((0, kysely_1.sql) `LOWER(email)`, '=', email.toLowerCase())
            .where('workspaceId', '=', workspaceId)
            .execute();
    }
    async getProviderById(opts) {
        const { providerId, workspaceId, type } = opts;
        const provider = await this.db
            .selectFrom('authProviders')
            .selectAll()
            .where('id', '=', providerId)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
        if (!provider || provider.type !== type) {
            return undefined;
        }
        return provider;
    }
    async getGoogleProviderForWorkspace(workspaceId) {
        return await this.db
            .selectFrom('authProviders')
            .selectAll()
            .where('type', '=', constants_1.SSO_PROVIDER.GOOGLE)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
    }
    buildCallbackUrl(opts) {
        const { providerId, type, hostname } = opts;
        const baseUrl = this.domainService.getUrl(hostname);
        if (type === constants_1.SSO_PROVIDER.GOOGLE) {
            return `${baseUrl}/api/sso/${type}/callback`;
        }
        return `${baseUrl}/api/sso/${type}/${providerId}/callback`;
    }
    buildRedirectUrl(opts) {
        const { providerId, type, hostname } = opts;
        const baseUrl = this.domainService.getUrl(hostname);
        if (type === constants_1.SSO_PROVIDER.GOOGLE) {
            return `${baseUrl}/api/sso/${type}/login`;
        }
        return `${baseUrl}/api/sso/${type}/${providerId}/login`;
    }
    buildSamlIssuer(opts) {
        const { providerId, hostname } = opts;
        const baseUrl = this.domainService.getUrl(hostname);
        return `${baseUrl}/api/sso/${constants_1.SSO_PROVIDER.SAML}/${providerId}/login`;
    }
    setCookieAndRedirect(res, authToken, req) {
        res.setCookie('authToken', authToken, {
            httpOnly: true,
            path: '/',
            expires: this.environmentService.getCookieExpiresIn(),
            secure: this.environmentService.isHttps(),
        });
        let target = '/home';
        if (req) {
            const cookieValue = req.cookies?.[sso_constants_1.SSO_REDIRECT_COOKIE];
            res.clearCookie(sso_constants_1.SSO_REDIRECT_COOKIE, { path: '/' });
            const safe = (0, sso_utils_1.safeRedirectPath)(cookieValue);
            if (safe)
                target = safe;
        }
        res.redirect(target, 302).send();
    }
    setSsoRedirectCookie(res, redirect) {
        const safe = (0, sso_utils_1.safeRedirectPath)(redirect);
        if (!safe)
            return;
        res.setCookie(sso_constants_1.SSO_REDIRECT_COOKIE, safe, {
            httpOnly: true,
            path: '/',
            secure: this.environmentService.isHttps(),
            sameSite: 'lax',
            expires: (0, date_fns_1.addMinutes)(new Date(), 10),
        });
    }
};
exports.SsoService = SsoService;
exports.SsoService = SsoService = SsoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, nestjs_kysely_1.InjectKysely)()),
    __param(5, (0, bullmq_1.InjectQueue)(constants_2.QueueName.BILLING_QUEUE)),
    __param(6, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [domain_service_1.DomainService,
        user_repo_1.UserRepo,
        group_user_repo_1.GroupUserRepo,
        environment_service_1.EnvironmentService, Object, bullmq_2.Queue, Object])
], SsoService);
//# sourceMappingURL=sso.service.js.map