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
exports.PagePermissionService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const page_permission_repo_1 = require("../../database/repos/page/page-permission.repo");
const page_repo_1 = require("../../database/repos/page/page.repo");
const permission_1 = require("../../common/helpers/types/permission");
const utils_1 = require("../../database/utils");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../integrations/queue/constants");
const space_ability_factory_1 = require("../../core/casl/abilities/space-ability.factory");
const space_ability_type_1 = require("../../core/casl/interfaces/space-ability.type");
const cursor_pagination_1 = require("../../database/pagination/cursor-pagination");
const ws_service_1 = require("../../ws/ws.service");
const ws_tree_service_1 = require("../../ws/ws-tree.service");
const audit_events_1 = require("../../common/events/audit-events");
const audit_service_1 = require("../../integrations/audit/audit.service");
let PagePermissionService = class PagePermissionService {
    constructor(pagePermissionRepo, pageRepo, spaceAbility, wsService, wsTreeService, db, notificationQueue, auditService) {
        this.pagePermissionRepo = pagePermissionRepo;
        this.pageRepo = pageRepo;
        this.spaceAbility = spaceAbility;
        this.wsService = wsService;
        this.wsTreeService = wsTreeService;
        this.db = db;
        this.notificationQueue = notificationQueue;
        this.auditService = auditService;
    }
    async restrictPage(pageId, authUser, workspaceId) {
        const page = await this.pageRepo.findById(pageId);
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.validateWriteAccess(page, authUser);
        const existingAccess = await this.pagePermissionRepo.findPageAccessByPageId(pageId);
        if (existingAccess) {
            throw new common_1.BadRequestException('Page is already restricted');
        }
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            const pageAccess = await this.pagePermissionRepo.insertPageAccess({
                pageId: pageId,
                spaceId: page.spaceId,
                workspaceId: workspaceId,
                accessLevel: permission_1.PageAccessLevel.RESTRICTED,
                creatorId: authUser.id,
            }, trx);
            await this.pagePermissionRepo.insertPagePermissions([
                {
                    pageAccessId: pageAccess.id,
                    userId: authUser.id,
                    role: permission_1.PagePermissionRole.WRITER,
                    addedById: authUser.id,
                },
            ], trx);
        });
        await this.wsService.invalidateSpaceRestrictionCache(page.spaceId);
        await this.wsTreeService.notifyPageRestricted(page, authUser.id);
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_RESTRICTED,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: pageId,
            spaceId: page.spaceId,
            metadata: { pageTitle: page.title },
        });
    }
    async addPagePermissions(dto, authUser, workspaceId) {
        const page = await this.pageRepo.findById(dto.pageId);
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.validateWriteAccess(page, authUser);
        const pageAccess = await this.pagePermissionRepo.findPageAccessByPageId(dto.pageId);
        if (!pageAccess) {
            throw new common_1.BadRequestException('Page is not restricted. Restrict the page first.');
        }
        let validUsers = [];
        let validGroups = [];
        if (dto.userIds && dto.userIds.length > 0) {
            validUsers = await this.db
                .selectFrom('users')
                .select(['id', 'name'])
                .where('id', 'in', dto.userIds)
                .where('workspaceId', '=', workspaceId)
                .where(({ not, exists, selectFrom }) => not(exists(selectFrom('pagePermissions')
                .select('id')
                .whereRef('pagePermissions.userId', '=', 'users.id')
                .where('pagePermissions.pageAccessId', '=', pageAccess.id))))
                .execute();
        }
        if (dto.groupIds && dto.groupIds.length > 0) {
            validGroups = await this.db
                .selectFrom('groups')
                .select(['id', 'name'])
                .where('id', 'in', dto.groupIds)
                .where('workspaceId', '=', workspaceId)
                .where(({ not, exists, selectFrom }) => not(exists(selectFrom('pagePermissions')
                .select('id')
                .whereRef('pagePermissions.groupId', '=', 'groups.id')
                .where('pagePermissions.pageAccessId', '=', pageAccess.id))))
                .execute();
        }
        const permissionsToAdd = [];
        for (const user of validUsers) {
            permissionsToAdd.push({
                pageAccessId: pageAccess.id,
                userId: user.id,
                role: dto.role,
                addedById: authUser.id,
            });
        }
        for (const group of validGroups) {
            permissionsToAdd.push({
                pageAccessId: pageAccess.id,
                groupId: group.id,
                role: dto.role,
                addedById: authUser.id,
            });
        }
        if (permissionsToAdd.length > 0) {
            await this.pagePermissionRepo.insertPagePermissions(permissionsToAdd);
            const allUserIds = validUsers.map((u) => u.id);
            if (validGroups.length > 0) {
                const groupMembers = await this.db
                    .selectFrom('groupUsers')
                    .select('userId')
                    .where('groupId', 'in', validGroups.map((g) => g.id))
                    .execute();
                allUserIds.push(...groupMembers.map((m) => m.userId));
            }
            try {
                await this.wsTreeService.notifyPermissionGranted(page, allUserIds);
                const notifyUserIds = validUsers
                    .map((u) => u.id)
                    .filter((id) => id !== authUser.id);
                if (notifyUserIds.length > 0) {
                    await this.notificationQueue.add(constants_1.QueueJob.PAGE_PERMISSION_GRANTED, {
                        userIds: notifyUserIds,
                        pageId: page.id,
                        spaceId: page.spaceId,
                        workspaceId,
                        actorId: authUser.id,
                        role: dto.role,
                    });
                }
            }
            catch (err) {
            }
            for (const user of validUsers) {
                this.auditService.log({
                    event: audit_events_1.AuditEvent.PAGE_PERMISSION_ADDED,
                    resourceType: audit_events_1.AuditResource.PAGE,
                    resourceId: page.id,
                    spaceId: page.spaceId,
                    changes: { after: { role: dto.role } },
                    metadata: {
                        pageTitle: page.title,
                        userId: user.id,
                        userName: user.name,
                        memberType: 'user',
                    },
                });
            }
            for (const group of validGroups) {
                this.auditService.log({
                    event: audit_events_1.AuditEvent.PAGE_PERMISSION_ADDED,
                    resourceType: audit_events_1.AuditResource.PAGE,
                    resourceId: page.id,
                    spaceId: page.spaceId,
                    changes: { after: { role: dto.role } },
                    metadata: {
                        pageTitle: page.title,
                        groupId: group.id,
                        groupName: group.name,
                        memberType: 'group',
                    },
                });
            }
        }
    }
    async removePagePermissions(dto, authUser) {
        const page = await this.pageRepo.findById(dto.pageId);
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.validateWriteAccess(page, authUser);
        const pageAccess = await this.pagePermissionRepo.findPageAccessByPageId(dto.pageId);
        if (!pageAccess)
            return;
        const userIds = dto.userIds ?? [];
        const groupIds = dto.groupIds ?? [];
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            if (userIds.length > 0) {
                await this.pagePermissionRepo.deletePagePermissionsByUserIds(pageAccess.id, userIds, trx);
            }
            if (groupIds.length > 0) {
                await this.pagePermissionRepo.deletePagePermissionsByGroupIds(pageAccess.id, groupIds, trx);
            }
            const writerCount = await this.pagePermissionRepo.countWritersByPageAccessId(pageAccess.id, { trx });
            if (writerCount < 1) {
                throw new common_1.BadRequestException('There must be at least one user with "Can edit" permission');
            }
        });
        for (const userId of userIds) {
            this.auditService.log({
                event: audit_events_1.AuditEvent.PAGE_PERMISSION_REMOVED,
                resourceType: audit_events_1.AuditResource.PAGE,
                resourceId: page.id,
                spaceId: page.spaceId,
                metadata: {
                    pageTitle: page.title,
                    userId,
                    memberType: 'user',
                },
            });
        }
        for (const groupId of groupIds) {
            this.auditService.log({
                event: audit_events_1.AuditEvent.PAGE_PERMISSION_REMOVED,
                resourceType: audit_events_1.AuditResource.PAGE,
                resourceId: page.id,
                spaceId: page.spaceId,
                metadata: {
                    pageTitle: page.title,
                    groupId,
                    memberType: 'group',
                },
            });
        }
    }
    async updatePagePermissionRole(dto, authUser) {
        const page = await this.pageRepo.findById(dto.pageId);
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.validateWriteAccess(page, authUser);
        const pageAccess = await this.pagePermissionRepo.findPageAccessByPageId(dto.pageId);
        if (!pageAccess) {
            throw new common_1.BadRequestException('Page is not restricted');
        }
        if (!dto.userId && !dto.groupId) {
            throw new common_1.BadRequestException('Please provide a userId or groupId');
        }
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            if (dto.userId) {
                const permission = await this.pagePermissionRepo.findPagePermissionByUserId(pageAccess.id, dto.userId, trx);
                if (!permission) {
                    throw new common_1.NotFoundException('Permission not found');
                }
                if (permission.role === dto.role) {
                    return;
                }
                if (permission.role === permission_1.PagePermissionRole.WRITER) {
                    await this.validateLastWriter(pageAccess.id, { trx });
                }
                await this.pagePermissionRepo.updatePagePermissionRole(pageAccess.id, dto.role, { userId: dto.userId }, trx);
            }
            else if (dto.groupId) {
                const permission = await this.pagePermissionRepo.findPagePermissionByGroupId(pageAccess.id, dto.groupId, trx);
                if (!permission) {
                    throw new common_1.NotFoundException('Permission not found');
                }
                if (permission.role === dto.role) {
                    return;
                }
                if (permission.role === permission_1.PagePermissionRole.WRITER) {
                    await this.validateLastWriter(pageAccess.id, { trx });
                }
                await this.pagePermissionRepo.updatePagePermissionRole(pageAccess.id, dto.role, { groupId: dto.groupId }, trx);
            }
        });
    }
    async removePageRestriction(pageId, authUser) {
        const page = await this.pageRepo.findById(pageId);
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.validateWriteAccess(page, authUser);
        const pageAccess = await this.pagePermissionRepo.findPageAccessByPageId(pageId);
        if (!pageAccess) {
            throw new common_1.BadRequestException('Page is not restricted');
        }
        await this.pagePermissionRepo.deletePageAccess(pageId);
        await this.wsService.invalidateSpaceRestrictionCache(page.spaceId);
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_RESTRICTION_REMOVED,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: pageId,
            spaceId: page.spaceId,
            metadata: { pageTitle: page.title },
        });
    }
    async getPagePermissions(pageId, authUser, pagination) {
        const page = await this.pageRepo.findById(pageId);
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        const ability = await this.spaceAbility.createForUser(authUser, page.spaceId);
        if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
            throw new common_1.ForbiddenException();
        }
        const canView = await this.canViewPage(authUser.id, pageId);
        if (!canView) {
            throw new common_1.ForbiddenException();
        }
        const pageAccess = await this.pagePermissionRepo.findPageAccessByPageId(pageId);
        if (!pageAccess) {
            return (0, cursor_pagination_1.emptyCursorPaginationResult)(pagination.limit);
        }
        return this.pagePermissionRepo.getPagePermissionsPaginated(pageAccess.id, pagination);
    }
    async getPageRestrictionInfo(pageId, authUser) {
        const page = await this.pageRepo.findById(pageId);
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        const ability = await this.spaceAbility.createForUser(authUser, page.spaceId);
        if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
            throw new common_1.ForbiddenException();
        }
        const { hasDirectRestriction, hasInheritedRestriction, canAccess, canEdit, } = await this.pagePermissionRepo.getUserPageAccessLevel(authUser.id, pageId);
        if (!canAccess) {
            throw new common_1.NotFoundException('Permission not found');
        }
        const canManage = this.computeCanManage(ability, canEdit, canAccess);
        let restrictionId;
        let inheritedFrom;
        if (hasDirectRestriction || hasInheritedRestriction) {
            const restriction = await this.pagePermissionRepo.findRestrictedAncestor(pageId);
            if (restriction) {
                restrictionId = restriction.pageAccessId;
                if (hasInheritedRestriction) {
                    const inheritedRestriction = restriction.pageId === pageId && page.parentPageId
                        ? await this.pagePermissionRepo.findRestrictedAncestor(page.parentPageId)
                        : restriction;
                    if (inheritedRestriction) {
                        const ancestorPage = await this.pageRepo.findById(inheritedRestriction.pageId);
                        if (ancestorPage) {
                            inheritedFrom = {
                                id: ancestorPage.id,
                                slugId: ancestorPage.slugId,
                                title: ancestorPage.title,
                            };
                        }
                    }
                }
            }
        }
        return {
            ...(restrictionId && { restrictionId }),
            hasDirectRestriction,
            hasInheritedRestriction,
            inheritedFrom: inheritedFrom ?? null,
            userAccess: {
                canView: canAccess,
                canEdit,
                canManage,
            },
        };
    }
    computeCanManage(ability, canEdit, canView) {
        if (ability.cannot(space_ability_type_1.SpaceCaslAction.Edit, space_ability_type_1.SpaceCaslSubject.Page)) {
            return false;
        }
        if (canEdit) {
            return true;
        }
        const isSpaceAdmin = ability.can(space_ability_type_1.SpaceCaslAction.Manage, space_ability_type_1.SpaceCaslSubject.Page);
        return isSpaceAdmin && canView;
    }
    async validateLastWriter(pageAccessId, opts) {
        const writerCount = await this.pagePermissionRepo.countWritersByPageAccessId(pageAccessId, opts);
        if (writerCount <= 1) {
            throw new common_1.BadRequestException('There must be at least one user with "Can edit" permission');
        }
    }
    async validateWriteAccess(page, user) {
        const ability = await this.spaceAbility.createForUser(user, page.spaceId);
        if (ability.cannot(space_ability_type_1.SpaceCaslAction.Edit, space_ability_type_1.SpaceCaslSubject.Page)) {
            throw new common_1.ForbiddenException();
        }
        const { canAccess, canEdit } = await this.canEditPage(user.id, page.id);
        if (!canAccess) {
            throw new common_1.ForbiddenException();
        }
        if (canEdit) {
            return;
        }
        const isSpaceAdmin = ability.can(space_ability_type_1.SpaceCaslAction.Manage, space_ability_type_1.SpaceCaslSubject.Page);
        if (isSpaceAdmin) {
            const canView = await this.canViewPage(user.id, page.id);
            if (canView) {
                return;
            }
        }
        throw new common_1.ForbiddenException();
    }
    async canViewPage(userId, pageId) {
        return this.pagePermissionRepo.canUserAccessPage(userId, pageId);
    }
    async canEditPage(userId, pageId) {
        return this.pagePermissionRepo.canUserEditPage(userId, pageId);
    }
};
exports.PagePermissionService = PagePermissionService;
exports.PagePermissionService = PagePermissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, nestjs_kysely_1.InjectKysely)()),
    __param(6, (0, bullmq_1.InjectQueue)(constants_1.QueueName.NOTIFICATION_QUEUE)),
    __param(7, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [page_permission_repo_1.PagePermissionRepo,
        page_repo_1.PageRepo,
        space_ability_factory_1.default,
        ws_service_1.WsService,
        ws_tree_service_1.WsTreeService, Object, bullmq_2.Queue, Object])
], PagePermissionService);
//# sourceMappingURL=page-permission.service.js.map