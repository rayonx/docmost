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
exports.PagePermissionController = void 0;
const common_1 = require("@nestjs/common");
const page_permission_service_1 = require("./page-permission.service");
const page_permission_dto_1 = require("./dto/page-permission.dto");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
const pagination_options_1 = require("../../database/pagination/pagination-options");
let PagePermissionController = class PagePermissionController {
    constructor(pagePermissionService) {
        this.pagePermissionService = pagePermissionService;
    }
    async restrictPage(dto, user, workspace) {
        await this.pagePermissionService.restrictPage(dto.pageId, user, workspace.id);
    }
    async removePageRestriction(dto, user) {
        await this.pagePermissionService.removePageRestriction(dto.pageId, user);
    }
    async addPagePermission(dto, user, workspace) {
        validateMemberIds(dto);
        await this.pagePermissionService.addPagePermissions(dto, user, workspace.id);
    }
    async removePagePermissions(dto, user) {
        validateMemberIds(dto);
        await this.pagePermissionService.removePagePermissions(dto, user);
    }
    async updatePagePermissionRole(dto, user) {
        if (!dto.userId && !dto.groupId) {
            throw new common_1.BadRequestException('userId or groupId is required');
        }
        await this.pagePermissionService.updatePagePermissionRole(dto, user);
    }
    async getPagePermissions(dto, pagination, user) {
        return this.pagePermissionService.getPagePermissions(dto.pageId, user, pagination);
    }
    async getPageRestrictionInfo(dto, user) {
        return this.pagePermissionService.getPageRestrictionInfo(dto.pageId, user);
    }
};
exports.PagePermissionController = PagePermissionController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.PAGE_PERMISSIONS),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('restrict'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_permission_dto_1.RestrictPageDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PagePermissionController.prototype, "restrictPage", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.PAGE_PERMISSIONS),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('remove-restriction'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_permission_dto_1.RemovePageRestrictionDto, Object]),
    __metadata("design:returntype", Promise)
], PagePermissionController.prototype, "removePageRestriction", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.PAGE_PERMISSIONS),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('add-permission'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_permission_dto_1.AddPagePermissionDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PagePermissionController.prototype, "addPagePermission", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.PAGE_PERMISSIONS),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('remove-permission'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_permission_dto_1.RemovePagePermissionDto, Object]),
    __metadata("design:returntype", Promise)
], PagePermissionController.prototype, "removePagePermissions", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.PAGE_PERMISSIONS),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('update-permission'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_permission_dto_1.UpdatePagePermissionRoleDto, Object]),
    __metadata("design:returntype", Promise)
], PagePermissionController.prototype, "updatePagePermissionRole", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('permissions'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_permission_dto_1.PageIdDto,
        pagination_options_1.PaginationOptions, Object]),
    __metadata("design:returntype", Promise)
], PagePermissionController.prototype, "getPagePermissions", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('permission-info'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_permission_dto_1.PageIdDto, Object]),
    __metadata("design:returntype", Promise)
], PagePermissionController.prototype, "getPageRestrictionInfo", null);
exports.PagePermissionController = PagePermissionController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pages'),
    __metadata("design:paramtypes", [page_permission_service_1.PagePermissionService])
], PagePermissionController);
function validateMemberIds(dto) {
    if ((!dto.userIds || dto.userIds.length === 0) &&
        (!dto.groupIds || dto.groupIds.length === 0)) {
        throw new common_1.BadRequestException('userIds or groupIds is required');
    }
}
//# sourceMappingURL=page-permission.controller.js.map