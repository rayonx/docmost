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
exports.SsoController = void 0;
const common_1 = require("@nestjs/common");
const sso_dto_1 = require("../dto/sso.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const workspace_ability_factory_1 = require("../../../core/casl/abilities/workspace-ability.factory");
const workspace_ability_type_1 = require("../../../core/casl/interfaces/workspace-ability.type");
const auth_user_decorator_1 = require("../../../common/decorators/auth-user.decorator");
const pagination_options_1 = require("../../../database/pagination/pagination-options");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const manage_sso_service_1 = require("../services/manage-sso.service");
const feature_guard_1 = require("../../licence/guards/feature.guard");
const feature_registry_1 = require("../../licence/feature-registry");
const audit_events_1 = require("../../../common/events/audit-events");
const sso_utils_1 = require("../sso.utils");
const audit_service_1 = require("../../../integrations/audit/audit.service");
let SsoController = class SsoController {
    constructor(manageSsoService, workspaceAbility, auditService) {
        this.manageSsoService = manageSsoService;
        this.workspaceAbility = workspaceAbility;
        this.auditService = auditService;
    }
    async getSsoProviders(pagination, user, workspace) {
        await this.validateAccess(user, workspace);
        return this.manageSsoService.getProviders(workspace, pagination);
    }
    async getSsoProvider(dto, user, workspace) {
        await this.validateAccess(user, workspace);
        return this.manageSsoService.getProvider(dto.providerId, workspace.id);
    }
    async createSsoProvider(dto, user, workspace) {
        await this.validateAccess(user, workspace);
        const provider = await this.manageSsoService.createProvider(dto, {
            workspaceId: workspace.id,
            creatorId: user.id,
        });
        this.auditService.log({
            event: audit_events_1.AuditEvent.SSO_PROVIDER_CREATED,
            resourceType: audit_events_1.AuditResource.SSO_PROVIDER,
            resourceId: provider.id,
            changes: {
                after: {
                    name: provider.name,
                    type: provider.type,
                    isEnabled: provider.isEnabled,
                    groupSync: provider.groupSync,
                },
            },
        });
        return provider;
    }
    async updateSsoProvider(dto, user, workspace) {
        await this.validateAccess(user, workspace);
        const providerBefore = await this.manageSsoService.getProvider(dto.providerId, workspace.id);
        const provider = await this.manageSsoService.updateProvider(dto, workspace.id);
        const changes = (0, sso_utils_1.diffSsoProvider)(dto, providerBefore, provider);
        if (changes) {
            this.auditService.log({
                event: audit_events_1.AuditEvent.SSO_PROVIDER_UPDATED,
                resourceType: audit_events_1.AuditResource.SSO_PROVIDER,
                resourceId: provider.id,
                changes,
            });
        }
        return provider;
    }
    async deleteSsoProvider(dto, user, workspace) {
        await this.validateAccess(user, workspace);
        const provider = await this.manageSsoService.getProvider(dto.providerId, workspace.id);
        await this.manageSsoService.deleteProvider(dto.providerId, workspace.id);
        this.auditService.log({
            event: audit_events_1.AuditEvent.SSO_PROVIDER_DELETED,
            resourceType: audit_events_1.AuditResource.SSO_PROVIDER,
            resourceId: dto.providerId,
            changes: {
                before: {
                    name: provider.name,
                    type: provider.type,
                },
            },
        });
    }
    async validateAccess(user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Settings)) {
            throw new common_1.ForbiddenException();
        }
    }
};
exports.SsoController = SsoController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('providers'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_options_1.PaginationOptions, Object, Object]),
    __metadata("design:returntype", Promise)
], SsoController.prototype, "getSsoProviders", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('info'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sso_dto_1.SsoProviderIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SsoController.prototype, "getSsoProvider", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SSO_CUSTOM),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sso_dto_1.CreateSsoProviderDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SsoController.prototype, "createSsoProvider", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SSO_CUSTOM),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sso_dto_1.UpdateSsoProviderDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SsoController.prototype, "updateSsoProvider", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SSO_CUSTOM),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sso_dto_1.SsoProviderIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SsoController.prototype, "deleteSsoProvider", null);
exports.SsoController = SsoController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sso'),
    __param(2, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [manage_sso_service_1.ManageSsoService,
        workspace_ability_factory_1.default, Object])
], SsoController);
//# sourceMappingURL=sso.controller.js.map