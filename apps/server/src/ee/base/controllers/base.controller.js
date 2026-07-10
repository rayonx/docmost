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
exports.BaseController = void 0;
const common_1 = require("@nestjs/common");
const base_service_1 = require("../services/base.service");
const base_csv_export_service_1 = require("../services/base-csv-export.service");
const base_page_resolver_service_1 = require("../services/base-page-resolver.service");
const base_repo_1 = require("../repos/base.repo");
const create_base_dto_1 = require("../dto/create-base.dto");
const update_base_dto_1 = require("../dto/update-base.dto");
const base_dto_1 = require("../dto/base.dto");
const convert_base_dto_1 = require("../dto/convert-base.dto");
const export_base_dto_1 = require("../dto/export-base.dto");
const resolve_pages_dto_1 = require("../dto/resolve-pages.dto");
const auth_user_decorator_1 = require("../../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
const pagination_options_1 = require("../../../database/pagination/pagination-options");
const space_ability_type_1 = require("../../../core/casl/interfaces/space-ability.type");
const space_ability_factory_1 = require("../../../core/casl/abilities/space-ability.factory");
const space_id_dto_1 = require("../../../core/space/dto/space-id.dto");
const page_access_service_1 = require("../../../core/page/page-access/page-access.service");
const page_permission_repo_1 = require("../../../database/repos/page/page-permission.repo");
const page_repo_1 = require("../../../database/repos/page/page.repo");
let BaseController = class BaseController {
    constructor(baseService, baseCsvExportService, basePageResolverService, baseRepo, spaceAbility, pageAccessService, pagePermissionRepo, pageRepo) {
        this.baseService = baseService;
        this.baseCsvExportService = baseCsvExportService;
        this.basePageResolverService = basePageResolverService;
        this.baseRepo = baseRepo;
        this.spaceAbility = spaceAbility;
        this.pageAccessService = pageAccessService;
        this.pagePermissionRepo = pagePermissionRepo;
        this.pageRepo = pageRepo;
    }
    async create(dto, user, workspace) {
        if (dto.parentPageId) {
            const parent = await this.pageRepo.findById(dto.parentPageId);
            if (!parent) {
                throw new common_1.NotFoundException('Parent page not found');
            }
            await this.pageAccessService.validateCanEdit(parent, user);
            return this.baseService.create(user.id, parent.workspaceId, {
                ...dto,
                spaceId: parent.spaceId,
            }, { template: dto.template });
        }
        if (!dto.spaceId) {
            throw new common_1.BadRequestException('spaceId or parentPageId is required');
        }
        const ability = await this.spaceAbility.createForUser(user, dto.spaceId);
        if (ability.cannot(space_ability_type_1.SpaceCaslAction.Create, space_ability_type_1.SpaceCaslSubject.Page)) {
            throw new common_1.ForbiddenException();
        }
        return this.baseService.create(user.id, workspace.id, dto, { template: dto.template });
    }
    async getBase(dto, user) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        const { canEdit, hasRestriction } = await this.pageAccessService.validateCanViewWithPermissions(base, user);
        const info = await this.baseService.getBaseInfo(dto.pageId);
        return { ...info, permissions: { canEdit, hasRestriction } };
    }
    async convert(dto, user, workspace) {
        const page = await this.pageRepo.findById(dto.pageId);
        if (!page || page.deletedAt || page.workspaceId !== workspace.id) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.pageAccessService.validateCanEdit(page, user);
        return this.baseService.convertPageToBase(page, user.id, dto.template);
    }
    async update(dto, user) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.pageAccessService.validateCanEdit(base, user);
        return this.baseService.update(dto);
    }
    async delete(dto, user) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.pageAccessService.validateCanEdit(base, user);
        await this.baseService.delete(dto.pageId);
    }
    async list(dto, pagination, user) {
        const ability = await this.spaceAbility.createForUser(user, dto.spaceId);
        if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
            throw new common_1.ForbiddenException();
        }
        const result = await this.baseService.listBySpaceId(dto.spaceId, pagination);
        const accessible = await this.pagePermissionRepo.filterAccessiblePageIds({
            pageIds: result.items.map((b) => b.id),
            userId: user.id,
        });
        const accessibleSet = new Set(accessible);
        return {
            ...result,
            items: result.items.filter((b) => accessibleSet.has(b.id)),
        };
    }
    async exportCsv(dto, user, workspace, res) {
        const base = await this.baseRepo.findById(dto.pageId);
        if (!base) {
            throw new common_1.NotFoundException('Base not found');
        }
        await this.pageAccessService.validateCanView(base, user);
        await this.baseCsvExportService.streamBaseAsCsv(dto.pageId, workspace.id, user.id, res);
    }
    async resolvePages(dto, user, workspace) {
        const items = await this.basePageResolverService.resolvePages(dto.pageIds, workspace.id, user.id);
        return { items };
    }
};
exports.BaseController = BaseController;
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_base_dto_1.CreateBaseDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "create", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('info'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [base_dto_1.BaseIdDto, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "getBase", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('convert'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [convert_base_dto_1.ConvertBaseDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "convert", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_base_dto_1.UpdateBaseDto, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "update", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.BASES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [base_dto_1.BaseIdDto, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "delete", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [space_id_dto_1.SpaceIdDto,
        pagination_options_1.PaginationOptions, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "list", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('export-csv'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_base_dto_1.ExportBaseCsvDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('pages/expand'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resolve_pages_dto_1.ResolvePagesDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "resolvePages", null);
exports.BaseController = BaseController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bases'),
    __metadata("design:paramtypes", [base_service_1.BaseService,
        base_csv_export_service_1.BaseCsvExportService,
        base_page_resolver_service_1.BasePageResolverService,
        base_repo_1.BaseRepo,
        space_ability_factory_1.default,
        page_access_service_1.PageAccessService,
        page_permission_repo_1.PagePermissionRepo,
        page_repo_1.PageRepo])
], BaseController);
//# sourceMappingURL=base.controller.js.map