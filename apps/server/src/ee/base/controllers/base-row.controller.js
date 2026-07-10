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
exports.BaseRowController = void 0;
const common_1 = require("@nestjs/common");
const base_row_service_1 = require("../services/base-row.service");
const base_repo_1 = require("../repos/base.repo");
const create_row_dto_1 = require("../dto/create-row.dto");
const update_row_dto_1 = require("../dto/update-row.dto");
const auth_user_decorator_1 = require("../../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
const pagination_options_1 = require("../../../database/pagination/pagination-options");
const base_access_cache_service_1 = require("../services/base-access-cache.service");
let BaseRowController = class BaseRowController {
    constructor(baseRowService, baseRepo, baseAccessCache) {
        this.baseRowService = baseRowService;
        this.baseRepo = baseRepo;
        this.baseAccessCache = baseAccessCache;
    }
    async create(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.baseAccessCache.validateCanEdit(base, user);
        return this.baseRowService.create(user.id, workspace.id, dto, base.baseSchemaVersion ?? 0);
    }
    async getRow(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.baseAccessCache.validateCanView(base, user);
        return this.baseRowService.getRowInfo(dto.rowId, dto.pageId, workspace.id);
    }
    async update(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.baseAccessCache.validateCanEdit(base, user);
        return this.baseRowService.update(dto, workspace.id, user.id, base.baseSchemaVersion ?? 0);
    }
    async delete(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.baseAccessCache.validateCanEdit(base, user);
        await this.baseRowService.delete(dto, workspace.id, user.id);
    }
    async deleteMany(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.baseAccessCache.validateCanEdit(base, user);
        await this.baseRowService.deleteMany(dto, workspace.id, user.id);
    }
    async list(dto, pagination, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.baseAccessCache.validateCanView(base, user);
        return this.baseRowService.list(dto, pagination, workspace.id, user.id, base.baseSchemaVersion ?? 0);
    }
    async reorder(dto, user, workspace) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.baseAccessCache.validateCanEdit(base, user);
        await this.baseRowService.reorder(dto, workspace.id, user.id);
    }
};
exports.BaseRowController = BaseRowController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_row_dto_1.CreateRowDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseRowController.prototype, "create", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('info'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_row_dto_1.RowIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseRowController.prototype, "getRow", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_row_dto_1.UpdateRowDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseRowController.prototype, "update", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_row_dto_1.DeleteRowDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseRowController.prototype, "delete", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('delete-many'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_row_dto_1.DeleteRowsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseRowController.prototype, "deleteMany", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __param(3, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_row_dto_1.ListRowsDto,
        pagination_options_1.PaginationOptions, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseRowController.prototype, "list", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('reorder'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_row_dto_1.ReorderRowDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseRowController.prototype, "reorder", null);
exports.BaseRowController = BaseRowController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bases/rows'),
    __metadata("design:paramtypes", [base_row_service_1.BaseRowService,
        base_repo_1.BaseRepo,
        base_access_cache_service_1.BaseAccessCacheService])
], BaseRowController);
//# sourceMappingURL=base-row.controller.js.map