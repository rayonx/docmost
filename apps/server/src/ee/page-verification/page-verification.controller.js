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
exports.PageVerificationController = void 0;
const common_1 = require("@nestjs/common");
const page_verification_service_1 = require("./page-verification.service");
const page_verification_dto_1 = require("./dto/page-verification.dto");
const pagination_options_1 = require("../../database/pagination/pagination-options");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const license_guard_1 = require("../licence/guards/license.guard");
let PageVerificationController = class PageVerificationController {
    constructor(pageVerificationService) {
        this.pageVerificationService = pageVerificationService;
    }
    async verifications(dto, pagination, user, workspace) {
        return this.pageVerificationService.listVerifications(dto, pagination, user, workspace.id);
    }
    async setupVerification(dto, user, workspace) {
        return this.pageVerificationService.setupVerification(dto, user, workspace.id);
    }
    async updateVerification(dto, user, workspace) {
        return this.pageVerificationService.updateVerification(dto, user, workspace.id);
    }
    async verifyPage(dto, user, workspace) {
        return this.pageVerificationService.verifyPage(dto.pageId, user, workspace.id);
    }
    async getVerificationInfo(dto, user, workspace) {
        return this.pageVerificationService.getVerificationInfo(dto.pageId, user, workspace.id);
    }
    async removeVerification(dto, user, workspace) {
        return this.pageVerificationService.removeVerification(dto.pageId, user, workspace.id);
    }
    async submitForApproval(dto, user, workspace) {
        return this.pageVerificationService.submitForApproval(dto.pageId, user, workspace.id);
    }
    async rejectApproval(dto, user, workspace) {
        return this.pageVerificationService.rejectApproval(dto.pageId, dto.comment, user, workspace.id);
    }
    async markObsolete(dto, user, workspace) {
        return this.pageVerificationService.markObsolete(dto.pageId, user, workspace.id);
    }
};
exports.PageVerificationController = PageVerificationController;
__decorate([
    (0, common_1.UseGuards)(license_guard_1.LicenseGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('verifications'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __param(3, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_verification_dto_1.ListVerificationsDto,
        pagination_options_1.PaginationOptions, Object, Object]),
    __metadata("design:returntype", Promise)
], PageVerificationController.prototype, "verifications", null);
__decorate([
    (0, common_1.UseGuards)(license_guard_1.LicenseGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create-verification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_verification_dto_1.SetupVerificationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PageVerificationController.prototype, "setupVerification", null);
__decorate([
    (0, common_1.UseGuards)(license_guard_1.LicenseGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('update-verification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_verification_dto_1.UpdateVerificationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PageVerificationController.prototype, "updateVerification", null);
__decorate([
    (0, common_1.UseGuards)(license_guard_1.LicenseGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_verification_dto_1.VerifyPageDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PageVerificationController.prototype, "verifyPage", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('verification-info'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_verification_dto_1.PageVerificationPageIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PageVerificationController.prototype, "getVerificationInfo", null);
__decorate([
    (0, common_1.UseGuards)(license_guard_1.LicenseGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('delete-verification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_verification_dto_1.RemoveVerificationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PageVerificationController.prototype, "removeVerification", null);
__decorate([
    (0, common_1.UseGuards)(license_guard_1.LicenseGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('submit-for-approval'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_verification_dto_1.SubmitForApprovalDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PageVerificationController.prototype, "submitForApproval", null);
__decorate([
    (0, common_1.UseGuards)(license_guard_1.LicenseGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('reject-approval'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_verification_dto_1.RejectApprovalDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PageVerificationController.prototype, "rejectApproval", null);
__decorate([
    (0, common_1.UseGuards)(license_guard_1.LicenseGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('mark-obsolete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_verification_dto_1.ObsoletePageDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PageVerificationController.prototype, "markObsolete", null);
exports.PageVerificationController = PageVerificationController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pages'),
    __metadata("design:paramtypes", [page_verification_service_1.PageVerificationService])
], PageVerificationController);
//# sourceMappingURL=page-verification.controller.js.map