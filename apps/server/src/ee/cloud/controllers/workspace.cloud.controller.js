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
exports.WorkspaceCloudController = void 0;
const common_1 = require("@nestjs/common");
const workspace_cloud_service_1 = require("../services/workspace.cloud.service");
const cloud_access_guard_1 = require("../../guards/cloud-access.guard");
const create_workspace_dto_1 = require("../dto/create-workspace.dto");
const find_workspace_by_email_dto_1 = require("../dto/find-workspace-by-email.dto");
const resend_verification_dto_1 = require("../dto/resend-verification.dto");
const verify_email_dto_1 = require("../dto/verify-email.dto");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const environment_service_1 = require("../../../integrations/environment/environment.service");
let WorkspaceCloudController = class WorkspaceCloudController {
    constructor(workspaceCloudService, environmentService) {
        this.workspaceCloudService = workspaceCloudService;
        this.environmentService = environmentService;
    }
    async create(dto) {
        return this.workspaceCloudService.createWorkspace(dto);
    }
    async getJoinWorkspaces(req) {
        const joinedWorkspaces = req.cookies?.['joinedWorkspaces'];
        return this.workspaceCloudService.getJoinedWorkspaceList(joinedWorkspaces);
    }
    async findByEmail(dto) {
        await this.workspaceCloudService.findWorkspacesByEmail(dto.email);
    }
    async verifyEmail(dto, workspace, res) {
        const authToken = await this.workspaceCloudService.verifyEmail(dto.token, workspace.id);
        res.setCookie('authToken', authToken, {
            httpOnly: true,
            path: '/',
            expires: this.environmentService.getCookieExpiresIn(),
            secure: this.environmentService.isHttps(),
        });
    }
    async resendVerification(dto, workspace) {
        await this.workspaceCloudService.resendVerificationEmail(dto.email, workspace.id, dto.sig);
    }
};
exports.WorkspaceCloudController = WorkspaceCloudController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_workspace_dto_1.CreateCloudWorkspaceDto]),
    __metadata("design:returntype", Promise)
], WorkspaceCloudController.prototype, "create", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('joined'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkspaceCloudController.prototype, "getJoinWorkspaces", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('find-by-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_workspace_by_email_dto_1.FindWorkspaceByEmailDto]),
    __metadata("design:returntype", Promise)
], WorkspaceCloudController.prototype, "findByEmail", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkspaceCloudController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('resend-verification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_verification_dto_1.ResendVerificationDto, Object]),
    __metadata("design:returntype", Promise)
], WorkspaceCloudController.prototype, "resendVerification", null);
exports.WorkspaceCloudController = WorkspaceCloudController = __decorate([
    (0, common_1.UseGuards)(cloud_access_guard_1.CloudAccessGuard),
    (0, common_1.Controller)('workspace'),
    __metadata("design:paramtypes", [workspace_cloud_service_1.WorkspaceCloudService,
        environment_service_1.EnvironmentService])
], WorkspaceCloudController);
//# sourceMappingURL=workspace.cloud.controller.js.map