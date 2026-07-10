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
exports.ScimController = void 0;
const common_1 = require("@nestjs/common");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const scim_user_dto_1 = require("../dto/scim-user.dto");
const scim_group_dto_1 = require("../dto/scim-group.dto");
const scimmy_1 = require("scimmy");
const skip_transform_decorator_1 = require("../../../common/decorators/skip-transform.decorator");
const scim_user_service_1 = require("../services/scim-user.service");
const scim_query_dto_1 = require("../dto/scim-query.dto");
const scim_group_service_1 = require("../services/scim-group.service");
const scim_auth_guard_1 = require("../guards/scim-auth.guard");
const scim_exception_filter_1 = require("../filters/scim-exception.filter");
let ScimController = class ScimController {
    constructor(scimUserService, scimGroupService) {
        this.scimUserService = scimUserService;
        this.scimGroupService = scimGroupService;
        scimmy_1.default.Config.set({
            documentationUri: 'https://docmost.com/docs/user-guide/authentication/scim',
            patch: true,
            filter: 100,
            bulk: {
                supported: false,
                maxOperations: 0,
                maxPayloadSize: 0,
            },
            authenticationSchemes: [
                {
                    name: 'OAuth Bearer Token',
                    description: 'Authentication scheme using the OAuth Bearer Token Standard',
                    specUri: 'https://www.rfc-editor.org/info/rfc6750',
                    type: 'oauthbearertoken',
                },
            ],
        });
        scimmy_1.default.Resources.declare(scimmy_1.default.Resources.User)
            .ingress(({ id, patch }, data, workspace) => id
            ? this.scimUserService.handleUpdateUser(id, data, workspace)
            : this.scimUserService.handleCreateUser(data, workspace))
            .egress((resource, workspace) => {
            if (resource.id) {
                return this.scimUserService.handleGetUser(resource.id, workspace);
            }
            return this.scimUserService.handleGetUsers(resource, workspace);
        })
            .degress(({ id }, workspace) => this.scimUserService.handleDeleteUser(id, workspace));
        scimmy_1.default.Resources.declare(scimmy_1.default.Resources.Group)
            .ingress((resource, data, workspace) => {
            if (resource.id) {
                return this.scimGroupService.handleUpdateGroup(resource.id, data, workspace);
            }
            else {
                return this.scimGroupService.handleCreateGroup(data, workspace);
            }
        })
            .egress((resource, workspace) => {
            if (resource.id) {
                return this.scimGroupService.handleGetGroup(resource.id, workspace);
            }
            return this.scimGroupService.handleGetGroups(resource, workspace);
        })
            .degress(({ id }, workspace) => this.scimGroupService.handleDeleteGroup(id, workspace));
    }
    async getSchemas() {
        return new scimmy_1.default.Resources.Schema().read();
    }
    async getSchema(schemaId, res) {
        try {
            return res.code(200).send(await new scimmy_1.default.Resources.Schema(schemaId).read());
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async getServiceProviderConfig() {
        return new scimmy_1.default.Resources.ServiceProviderConfig().read();
    }
    async getResourceTypes() {
        return await new scimmy_1.default.Resources.ResourceType().read();
    }
    async getResourceType(resourceTypeId, res) {
        try {
            return res
                .code(200)
                .send(await new scimmy_1.default.Resources.ResourceType(resourceTypeId).read());
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async getUser(workspace, userId, query, res) {
        try {
            return res
                .code(200)
                .send(await new scimmy_1.default.Resources.User(userId, query).read(workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async getUsers(workspace, query, res) {
        try {
            return res
                .code(200)
                .send(await new scimmy_1.default.Resources.User(this.buildScimQueryOptions(query)).read(workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async createUser(workspace, dto, query, res) {
        try {
            return res
                .code(201)
                .send(await new scimmy_1.default.Resources.User(this.buildScimQueryOptions(query)).write(dto, workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async updateUser(workspace, userId, dto, query, res) {
        try {
            return res
                .code(200)
                .send(await new scimmy_1.default.Resources.User(userId, this.buildScimQueryOptions(query)).write(dto, workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async updateUserPatch(workspace, userId, dto, res) {
        try {
            return res
                .code(200)
                .send(await new scimmy_1.default.Resources.User(userId).patch(dto, workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async deleteUser(workspace, userId, res) {
        try {
            return res
                .code(204)
                .send(await new scimmy_1.default.Resources.User(userId).dispose(workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async getGroup(workspace, groupId, query, res) {
        try {
            return res
                .code(200)
                .send(await new scimmy_1.default.Resources.Group(groupId, query).read(workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async getGroups(workspace, query, res) {
        try {
            return res
                .code(200)
                .send(await new scimmy_1.default.Resources.Group(this.buildScimQueryOptions(query)).read(workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async createGroup(workspace, dto, query, res) {
        try {
            return res
                .code(201)
                .send(await new scimmy_1.default.Resources.Group(this.buildScimQueryOptions(query)).write(dto, workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async updateGroup(workspace, groupId, dto, query, res) {
        try {
            return res
                .code(200)
                .send(await new scimmy_1.default.Resources.Group(groupId, this.buildScimQueryOptions(query)).write(dto, workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async updateGroupPatch(workspace, groupId, dto, res) {
        try {
            return res
                .code(200)
                .send(await new scimmy_1.default.Resources.Group(groupId).patch(dto, workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    async deleteGroup(workspace, groupId, res) {
        try {
            return res
                .code(204)
                .send(await new scimmy_1.default.Resources.Group(groupId).dispose(workspace));
        }
        catch (err) {
            return this.handleScimError(res, err);
        }
    }
    handleScimError(res, err) {
        const scimError = new scimmy_1.default.Messages.Error(err);
        res
            .code(scimError.status)
            .header('Content-Type', 'application/scim+json')
            .send(scimError);
    }
    buildScimQueryOptions(query) {
        const startIndex = Number(query.startIndex) || 1;
        let count = Number(query.count);
        if (isNaN(count) || count < 0)
            count = 100;
        if (count > 100)
            count = 100;
        const sortBy = query.sortBy;
        return {
            startIndex,
            count,
            sortBy,
            ...(query.filter ? { filter: query.filter } : {}),
        };
    }
};
exports.ScimController = ScimController;
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Get)('/Schemas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "getSchemas", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Get)('/Schemas/:schemaId'),
    __param(0, (0, common_1.Param)('schemaId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "getSchema", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Get)('/ServiceProviderConfig'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "getServiceProviderConfig", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Get)('ResourceTypes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "getResourceTypes", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Get)('ResourceTypes/:resourceTypeId'),
    __param(0, (0, common_1.Param)('resourceTypeId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "getResourceType", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Get)('/Users/:userId'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, scim_query_dto_1.ScimQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "getUser", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Get)('/Users'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scim_query_dto_1.ScimQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "getUsers", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Post)('/Users'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scim_user_dto_1.CreateScimUserDto,
        scim_query_dto_1.ScimQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "createUser", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('/Users/:userId'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, scim_user_dto_1.UpdateScimUserDto,
        scim_query_dto_1.ScimQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "updateUser", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Patch)('/Users/:userId'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, scim_user_dto_1.PatchScimUserDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "updateUserPatch", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Delete)('/Users/:userId'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "deleteUser", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Get)('/Groups/:groupId'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, scim_query_dto_1.ScimQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "getGroup", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Get)('/Groups'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scim_query_dto_1.ScimQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "getGroups", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Post)('/Groups'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scim_group_dto_1.CreateScimGroupDto,
        scim_query_dto_1.ScimQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "createGroup", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('/Groups/:groupId'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, scim_group_dto_1.UpdateScimGroupDto,
        scim_query_dto_1.ScimQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "updateGroup", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Patch)('/Groups/:groupId'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, scim_group_dto_1.PatchScimGroupDto, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "updateGroupPatch", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Header)('Content-Type', 'application/scim+json'),
    (0, common_1.Delete)('/Groups/:groupId'),
    __param(0, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ScimController.prototype, "deleteGroup", null);
exports.ScimController = ScimController = __decorate([
    (0, common_1.UseFilters)(scim_exception_filter_1.ScimExceptionFilter),
    (0, common_1.UseGuards)(scim_auth_guard_1.ScimAuthGuard),
    (0, common_1.Controller)('scim/v2/'),
    __metadata("design:paramtypes", [scim_user_service_1.ScimUserService,
        scim_group_service_1.ScimGroupService])
], ScimController);
//# sourceMappingURL=scim.controller.js.map