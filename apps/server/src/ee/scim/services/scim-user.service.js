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
var ScimUserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScimUserService = void 0;
const common_1 = require("@nestjs/common");
const user_repo_1 = require("../../../database/repos/user/user.repo");
const scim_presenter_1 = require("../scim.presenter");
const scimmy_1 = require("scimmy");
const sso_utils_1 = require("../../sso/sso.utils");
const utils_1 = require("../../../database/utils");
const nestjs_kysely_1 = require("nestjs-kysely");
const group_user_repo_1 = require("../../../database/repos/group/group-user.repo");
const scim_utils_1 = require("../scim.utils");
const workspace_util_1 = require("../../../core/workspace/workspace.util");
let ScimUserService = ScimUserService_1 = class ScimUserService {
    constructor(userRepo, groupUserRepo, db) {
        this.userRepo = userRepo;
        this.groupUserRepo = groupUserRepo;
        this.db = db;
        this.logger = new common_1.Logger(ScimUserService_1.name);
    }
    async handleGetUser(userId, workspace) {
        const user = await this.userRepo.findById(userId, workspace.id, {
            includeScimExternalId: true,
        });
        if (!user) {
            throw new scimmy_1.default.Types.Error(404, null, 'User not found');
        }
        return (0, scim_presenter_1.presentScimUser)(user);
    }
    async handleGetUsers(resource, workspace) {
        const { filter, constraints } = resource;
        const startIndex = constraints.startIndex;
        const count = constraints.count;
        const sortBy = constraints.sortBy;
        const sortOrder = constraints.sortOrder || 'ascending';
        const offset = startIndex - 1;
        let query = this.db
            .selectFrom('users')
            .select([
            'id',
            'email',
            'name',
            'emailVerifiedAt',
            'avatarUrl',
            'workspaceId',
            'locale',
            'scimExternalId',
            'deactivatedAt',
            'createdAt',
            'updatedAt',
        ])
            .where('deletedAt', 'is', null)
            .where('workspaceId', '=', workspace.id);
        if (sortBy) {
            const sortDirection = sortOrder === 'descending' ? 'desc' : 'asc';
            switch (sortBy) {
                case 'userName':
                case 'email':
                    query = query.orderBy('email', sortDirection);
                    break;
                default:
                    query = query.orderBy('createdAt', 'asc');
            }
        }
        else {
            query = query.orderBy('createdAt', 'asc');
        }
        if (Array.isArray(filter) && filter.length > 0) {
            const clause = filter[0];
            const filterConditions = Object.entries(clause)
                .filter(([key]) => key !== 'expression')
                .map(([key, [op, value]]) => {
                if (op !== 'eq')
                    return null;
                if (typeof value === 'string') {
                    if (key === 'userName' || key === 'email')
                        return (eb) => eb('email', '=', value);
                    if (key === 'id')
                        return (eb) => eb('id', '=', value);
                    if (key === 'externalId')
                        return (eb) => eb('scimExternalId', '=', value);
                }
                if (key === 'active' && typeof value === 'boolean') {
                    return value
                        ? (eb) => eb('deactivatedAt', 'is', null)
                        : (eb) => eb('deactivatedAt', 'is not', null);
                }
                return null;
            })
                .filter(Boolean);
            if (filterConditions.length > 0) {
                query = query.where((eb) => eb.and(filterConditions.map((cond) => cond(eb))));
            }
        }
        const totalQuery = query
            .clearSelect()
            .clearOrderBy()
            .select((eb) => eb.fn.countAll().as('count'));
        let users = [];
        let totalResult;
        try {
            [users, totalResult] = await Promise.all([
                query.limit(count).offset(offset).execute(),
                totalQuery.executeTakeFirst(),
            ]);
        }
        catch (err) {
            throw new scimmy_1.default.Types.Error(400, null, err?.['message']);
        }
        const resources = users.map((user) => (0, scim_presenter_1.presentScimUser)(user));
        resources.length = Number(totalResult.count);
        return resources;
    }
    async handleCreateUser(data, workspace) {
        const externalId = data.externalId ?? null;
        const { name, email, active } = (0, scim_utils_1.formatScimUser)(data);
        const existingUser = await this.userRepo.findByEmail(email, workspace.id, {
            includeScimExternalId: true,
        });
        if (existingUser && !existingUser.deactivatedAt) {
            throw new scimmy_1.default.Types.Error(409, null, 'User with this email already exists');
        }
        if (existingUser?.deactivatedAt) {
            const updateData = {
                name: name || existingUser.name,
                deactivatedAt: active ? null : new Date(),
                scimExternalId: externalId,
            };
            await this.userRepo.updateUser(updateData, existingUser.id, workspace.id);
            existingUser.name = updateData.name;
            existingUser.deactivatedAt = updateData.deactivatedAt;
            existingUser.scimExternalId = externalId;
            existingUser.updatedAt = new Date();
            return (0, scim_presenter_1.presentScimUser)(existingUser);
        }
        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (workspace.emailDomains?.length > 0 &&
            !workspace.emailDomains.includes(emailDomain)) {
            throw new scimmy_1.default.Types.Error(400, null, `The email domain "${emailDomain}" is not approved for this workspace.`);
        }
        let createdUser;
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            createdUser = await this.userRepo.insertUser({
                name: name,
                email: email,
                emailVerifiedAt: new Date(),
                password: (0, sso_utils_1.generateRandomPassword)(),
                hasGeneratedPassword: true,
                scimExternalId: externalId,
                role: workspace.defaultRole,
                workspaceId: workspace.id,
                lastLoginAt: new Date(),
                deactivatedAt: active ? null : new Date(),
            }, trx, { pageEditMode: (0, workspace_util_1.getWorkspaceDefaultPageEditMode)(workspace) });
            await this.groupUserRepo.addUserToDefaultGroup(createdUser.id, workspace.id, trx);
        });
        createdUser.scimExternalId = externalId;
        return (0, scim_presenter_1.presentScimUser)(createdUser);
    }
    async handleUpdateUser(userId, data, workspace) {
        const user = await this.userRepo.findById(userId, workspace.id, {
            includeScimExternalId: true,
        });
        if (!user) {
            throw new scimmy_1.default.Types.Error(404, null, 'User not found');
        }
        const externalId = data.externalId ?? null;
        const { name, email, active } = (0, scim_utils_1.formatScimUser)(data);
        const updateData = {};
        if (externalId !== undefined) {
            updateData.scimExternalId = externalId;
            user.scimExternalId = externalId;
        }
        if (email && user.email !== email) {
            if (await this.userRepo.findByEmail(email, workspace.id)) {
                throw new scimmy_1.default.Types.Error(409, null, 'User with this email already exists');
            }
            updateData.email = email;
            user.email = email;
        }
        if (name) {
            updateData.name = name;
        }
        if (typeof active === 'boolean') {
            updateData.deactivatedAt = active ? null : new Date();
            user.deactivatedAt = active ? null : new Date();
        }
        await this.userRepo.updateUser(updateData, userId, workspace.id);
        user.updatedAt = new Date();
        return (0, scim_presenter_1.presentScimUser)(user);
    }
    async handleDeleteUser(userId, workspace) {
        this.logger.debug(`Deactivating user ${userId}`);
        const user = await this.userRepo.findById(userId, workspace.id);
        if (!user) {
            this.logger.debug(`User to deactivate not found ${userId}`);
            throw new scimmy_1.default.Types.Error(404, null, 'User not found');
        }
        await this.userRepo.updateUser({
            deactivatedAt: new Date(),
        }, userId, workspace.id);
        this.logger.debug(`Deactivated user ${userId}`);
    }
};
exports.ScimUserService = ScimUserService;
exports.ScimUserService = ScimUserService = ScimUserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [user_repo_1.UserRepo,
        group_user_repo_1.GroupUserRepo, Object])
], ScimUserService);
//# sourceMappingURL=scim-user.service.js.map