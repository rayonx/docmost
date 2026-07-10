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
exports.BaseViewController = void 0;
const common_1 = require("@nestjs/common");
const base_view_service_1 = require("../services/base-view.service");
const base_repo_1 = require("../repos/base.repo");
const create_view_dto_1 = require("../dto/create-view.dto");
const update_view_dto_1 = require("../dto/update-view.dto");
const base_dto_1 = require("../dto/base.dto");
const auth_user_decorator_1 = require("../../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
const page_access_service_1 = require("../../../core/page/page-access/page-access.service");
let BaseViewController = class BaseViewController {
    constructor(baseViewService, baseRepo, pageAccessService) {
        this.baseViewService = baseViewService;
        this.baseRepo = baseRepo;
        this.pageAccessService = pageAccessService;
    }
    async create(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.pageAccessService.validateCanEdit(base, user);
        return this.baseViewService.create(user.id, workspace.id, dto);
    }
    async update(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.pageAccessService.validateCanEdit(base, user);
        return this.baseViewService.update(dto, workspace.id, user.id);
    }
    async delete(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.pageAccessService.validateCanEdit(base, user);
        await this.baseViewService.delete(dto, workspace.id, user.id);
    }
    async list(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.pageAccessService.validateCanView(base, user);
        return this.baseViewService.listByBaseId(dto.pageId, workspace.id);
    }
};
exports.BaseViewController = BaseViewController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_view_dto_1.CreateViewDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseViewController.prototype, "create", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_view_dto_1.UpdateViewDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseViewController.prototype, "update", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_view_dto_1.DeleteViewDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseViewController.prototype, "delete", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [base_dto_1.BaseIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseViewController.prototype, "list", null);
exports.BaseViewController = BaseViewController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bases/views'),
    __metadata("design:paramtypes", [base_view_service_1.BaseViewService,
        base_repo_1.BaseRepo,
        page_access_service_1.PageAccessService])
], BaseViewController);
//# sourceMappingURL=base-view.controller.js.map