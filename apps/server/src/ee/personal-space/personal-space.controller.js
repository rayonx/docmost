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
exports.PersonalSpaceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const personal_space_service_1 = require("./services/personal-space.service");
const create_personal_space_dto_1 = require("./dto/create-personal-space.dto");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
let PersonalSpaceController = class PersonalSpaceController {
    constructor(personalSpaceService) {
        this.personalSpaceService = personalSpaceService;
    }
    async getMyPersonalSpace(user, workspace) {
        return this.personalSpaceService.findForUser(user.id, workspace.id);
    }
    async createPersonalSpace(dto, user, workspace) {
        return this.personalSpaceService.createForUser(user, workspace, dto?.name);
    }
};
exports.PersonalSpaceController = PersonalSpaceController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('info'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PersonalSpaceController.prototype, "getMyPersonalSpace", null);
__decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.PERSONAL_SPACES),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_personal_space_dto_1.CreatePersonalSpaceDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PersonalSpaceController.prototype, "createPersonalSpace", null);
exports.PersonalSpaceController = PersonalSpaceController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('personal-space'),
    __metadata("design:paramtypes", [personal_space_service_1.PersonalSpaceService])
], PersonalSpaceController);
//# sourceMappingURL=personal-space.controller.js.map