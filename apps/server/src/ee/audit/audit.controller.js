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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./services/audit.service");
const audit_query_service_1 = require("./services/audit-query.service");
const audit_log_dto_1 = require("./dto/audit-log.dto");
const audit_events_1 = require("../../common/events/audit-events");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const pagination_options_1 = require("../../database/pagination/pagination-options");
const workspace_ability_factory_1 = require("../../core/casl/abilities/workspace-ability.factory");
const workspace_ability_type_1 = require("../../core/casl/interfaces/workspace-ability.type");
const environment_service_1 = require("../../integrations/environment/environment.service");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
let AuditController = class AuditController {
    constructor(auditService, auditQueryService, workspaceAbility, environmentService) {
        this.auditService = auditService;
        this.auditQueryService = auditQueryService;
        this.workspaceAbility = workspaceAbility;
        this.environmentService = environmentService;
    }
    async listAuditLogs(dto, pagination, user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Audit)) {
            throw new common_1.ForbiddenException();
        }
        return this.auditQueryService.findByWorkspace(workspace.id, {
            event: dto.event,
            resourceType: dto.resourceType,
            resourceId: dto.resourceId,
            actorId: dto.actorId,
            spaceId: dto.spaceId,
            startDate: dto.startDate,
            endDate: dto.endDate,
        }, pagination);
    }
    async getRetention(user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Audit)) {
            throw new common_1.ForbiddenException();
        }
        const retentionDays = await this.auditQueryService.getRetention(workspace.id);
        return { retentionDays };
    }
    async updateRetention(dto, user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Audit)) {
            throw new common_1.ForbiddenException();
        }
        if (this.environmentService.isCloud() && dto.auditRetentionDays > 365) {
            throw new common_1.BadRequestException('Audit retention cannot exceed 365 days on cloud plans');
        }
        const previous = await this.auditQueryService.getRetention(workspace.id);
        if (previous !== dto.auditRetentionDays) {
            await this.auditQueryService.updateRetention(workspace.id, dto.auditRetentionDays);
            this.auditService.log({
                event: audit_events_1.AuditEvent.WORKSPACE_UPDATED,
                resourceType: audit_events_1.AuditResource.WORKSPACE,
                resourceId: workspace.id,
                changes: {
                    before: { auditRetentionDays: previous },
                    after: { auditRetentionDays: dto.auditRetentionDays },
                },
            });
        }
        return { retentionDays: dto.auditRetentionDays };
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __param(3, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_log_dto_1.ListAuditLogsDto,
        pagination_options_1.PaginationOptions, Object, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "listAuditLogs", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('retention'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getRetention", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('retention/update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_log_dto_1.UpdateAuditRetentionDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "updateRetention", null);
exports.AuditController = AuditController = __decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.AUDIT_LOGS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.Controller)('audit'),
    __metadata("design:paramtypes", [audit_service_1.AuditService,
        audit_query_service_1.AuditQueryService,
        workspace_ability_factory_1.default,
        environment_service_1.EnvironmentService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map