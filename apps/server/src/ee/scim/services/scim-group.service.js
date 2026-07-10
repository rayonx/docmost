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
var ScimGroupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScimGroupService = void 0;
const common_1 = require("@nestjs/common");
const scim_presenter_1 = require("../scim.presenter");
const scimmy_1 = require("scimmy");
const utils_1 = require("../../../database/utils");
const nestjs_kysely_1 = require("nestjs-kysely");
const group_repo_1 = require("../../../database/repos/group/group.repo");
const group_user_service_1 = require("../../../core/group/services/group-user.service");
let ScimGroupService = ScimGroupService_1 = class ScimGroupService {
    constructor(groupRepo, groupUserService, db) {
        this.groupRepo = groupRepo;
        this.groupUserService = groupUserService;
        this.db = db;
        this.logger = new common_1.Logger(ScimGroupService_1.name);
    }
    async handleGetGroup(groupId, workspace) {
        const group = await this.groupRepo.findById(groupId, workspace.id, {
            includeScimExternalId: true,
        });
        if (!group) {
            throw new scimmy_1.default.Types.Error(404, null, 'Group not found');
        }
        const groupMembers = await this.getUsersForGroup(group.id);
        return (0, scim_presenter_1.presentScimGroup)(group, groupMembers);
    }
    async handleGetGroups(resource, workspace) {
        const { filter, constraints } = resource;
        const startIndex = constraints.startIndex;
        const count = constraints.count;
        const sortBy = constraints.sortBy;
        const sortOrder = constraints.sortOrder || 'ascending';
        const offset = startIndex - 1;
        let query = this.db
            .selectFrom('groups')
            .select(['id', 'name', 'isDefault', 'scimExternalId', 'groups.createdAt', 'updatedAt'])
            .where('workspaceId', '=', workspace.id);
        if (sortBy) {
            const sortDirection = sortOrder === 'descending' ? 'desc' : 'asc';
            switch (sortBy) {
                case 'displayName':
                    query = query.orderBy('name', sortDirection);
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
                if (op !== 'eq' || typeof value !== 'string')
                    return null;
                if (key === 'displayName')
                    return (eb) => eb('name', '=', value);
                if (key === 'id')
                    return (eb) => eb('id', '=', value);
                if (key === 'externalId')
                    return (eb) => eb('scimExternalId', '=', value);
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
        let groups = [];
        let totalResult;
        try {
            [groups, totalResult] = await Promise.all([
                query.limit(count).offset(offset).execute(),
                totalQuery.executeTakeFirst(),
            ]);
        }
        catch (err) {
            throw new scimmy_1.default.Types.Error(400, null, err?.['message']);
        }
        const groupIds = groups.map((g) => g.id);
        const membersByGroupId = await this.getUsersForGroups(groupIds);
        const resources = groups.map((group) => (0, scim_presenter_1.presentScimGroup)(group, membersByGroupId.get(group.id) ?? []));
        resources.length = Number(totalResult.count);
        return resources;
    }
    async handleCreateGroup(data, workspace) {
        const groupName = data.displayName?.trim();
        const externalId = data.externalId ?? null;
        const members = Array.isArray(data.members) ? data.members : [];
        if (!groupName) {
            throw new scimmy_1.default.Types.Error(400, null, 'Group displayName is required');
        }
        const existingGroup = await this.groupRepo.findByName(groupName, workspace.id);
        if (existingGroup) {
            throw new scimmy_1.default.Types.Error(409, null, 'Group name already exists');
        }
        let createdGroup = null;
        try {
            await (0, utils_1.executeTx)(this.db, async (trx) => {
                const insertableGroup = {
                    name: groupName,
                    isDefault: false,
                    isExternal: true,
                    scimExternalId: externalId,
                    workspaceId: workspace.id,
                };
                createdGroup = await this.groupRepo.insertGroup(insertableGroup, trx);
                if (members?.length > 0) {
                    const userIds = members
                        .map((m) => m?.value)
                        .filter((v) => typeof v === 'string');
                    if (userIds.length > 0) {
                        await this.groupUserService.addUsersToGroupBatch(userIds, createdGroup.id, workspace.id, trx);
                    }
                }
                return createdGroup;
            });
        }
        catch (err) {
            throw new scimmy_1.default.Types.Error(400, null, err?.['message']);
        }
        this.logger.debug(`SCIM group (${groupName}) created with ${members?.length} members.`);
        createdGroup.scimExternalId = externalId;
        const groupMembers = await this.getUsersForGroup(createdGroup.id);
        return (0, scim_presenter_1.presentScimGroup)(createdGroup, groupMembers);
    }
    async handleUpdateGroup(groupId, data, workspace) {
        const group = await this.groupRepo.findById(groupId, workspace.id, {
            includeScimExternalId: true,
        });
        if (!group) {
            throw new scimmy_1.default.Types.Error(404, null, 'Group not found');
        }
        if (group.isDefault) {
            throw new scimmy_1.default.Types.Error(400, null, 'You cannot update a default group');
        }
        const externalId = data.externalId ?? null;
        const oldMembers = (await this.getUsersForGroup(group.id)).map((u) => u.id);
        const newMembers = (data.members ?? []).map((m) => m.value);
        const usersToAdd = newMembers.filter((uid) => !oldMembers.includes(uid));
        const usersToRemove = oldMembers.filter((uid) => !newMembers.includes(uid));
        try {
            await (0, utils_1.executeTx)(this.db, async (trx) => {
                await this.groupUserService.addUsersToGroupBatch(usersToAdd, group.id, workspace.id, trx);
                await this.removeUsersFromGroupBatch(usersToRemove, group.id, workspace.id, trx);
                const groupDisplayName = data.displayName?.trim();
                if (groupDisplayName && groupDisplayName !== group.name) {
                    const conflictGroup = await this.groupRepo.findByName(groupDisplayName, workspace.id, { trx });
                    if (conflictGroup && conflictGroup.id !== group.id) {
                        throw new scimmy_1.default.Types.Error(409, null, 'Another group already uses that name');
                    }
                    await this.groupRepo.update({ name: groupDisplayName }, group.id, workspace.id, trx);
                    group.name = groupDisplayName;
                }
                const groupUpdate = {};
                if (!group.isExternal) {
                    groupUpdate.isExternal = true;
                    group.isExternal = true;
                }
                if (externalId !== undefined) {
                    groupUpdate.scimExternalId = externalId;
                    group.scimExternalId = externalId;
                }
                if (Object.keys(groupUpdate).length > 0) {
                    await this.groupRepo.update(groupUpdate, group.id, workspace.id, trx);
                }
            });
        }
        catch (err) {
            if (err instanceof scimmy_1.default.Types.Error) {
                throw err;
            }
            this.logger.error({ err }, 'Failed to update SCIM group');
            throw new scimmy_1.default.Types.Error(400, null, 'Failed to update group');
        }
        group.updatedAt = new Date();
        const updatedMembers = await this.getUsersForGroup(group.id);
        this.logger.debug(`SCIM group (${group.name}) updated with. Member count: ${updatedMembers?.length} .`);
        return (0, scim_presenter_1.presentScimGroup)(group, updatedMembers);
    }
    async handleDeleteGroup(groupId, workspace) {
        const group = await this.groupRepo.findById(groupId, workspace.id);
        if (!group) {
            throw new scimmy_1.default.Types.Error(404, null, 'Group not found');
        }
        if (group.isDefault) {
            throw new scimmy_1.default.Types.Error(400, null, 'You cannot delete a default group');
        }
        await this.groupRepo.delete(group.id, workspace.id);
    }
    async getUsersForGroup(groupId) {
        return await this.db
            .selectFrom('groupUsers')
            .innerJoin('users', 'users.id', 'groupUsers.userId')
            .select(['users.id', 'users.email'])
            .where('groupUsers.groupId', '=', groupId)
            .orderBy('groupUsers.createdAt', 'asc')
            .execute();
    }
    async getUsersForGroups(groupIds) {
        const result = new Map();
        if (groupIds.length === 0)
            return result;
        const rows = await this.db
            .selectFrom('groupUsers')
            .innerJoin('users', 'users.id', 'groupUsers.userId')
            .select(['groupUsers.groupId', 'users.id', 'users.email'])
            .where('groupUsers.groupId', 'in', groupIds)
            .orderBy('groupUsers.createdAt', 'asc')
            .execute();
        for (const row of rows) {
            let members = result.get(row.groupId);
            if (!members) {
                members = [];
                result.set(row.groupId, members);
            }
            members.push({ id: row.id, email: row.email });
        }
        return result;
    }
    async removeUsersFromGroupBatch(userIds, groupId, workspaceId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        if (userIds.length === 0)
            return;
        const validUserIds = await db
            .selectFrom('users')
            .select('id')
            .where('users.id', 'in', userIds)
            .where('users.workspaceId', '=', workspaceId)
            .execute()
            .then((rows) => rows.map((r) => r.id));
        if (validUserIds.length === 0)
            return;
        await db
            .deleteFrom('groupUsers')
            .where('groupId', '=', groupId)
            .where('userId', 'in', validUserIds)
            .execute();
    }
};
exports.ScimGroupService = ScimGroupService;
exports.ScimGroupService = ScimGroupService = ScimGroupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [group_repo_1.GroupRepo,
        group_user_service_1.GroupUserService, Object])
], ScimGroupService);
//# sourceMappingURL=scim-group.service.js.map