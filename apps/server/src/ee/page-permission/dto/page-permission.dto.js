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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemovePageRestrictionDto = exports.UpdatePagePermissionRoleDto = exports.RemovePagePermissionDto = exports.AddPagePermissionDto = exports.RestrictPageDto = exports.PageIdDto = void 0;
const class_validator_1 = require("class-validator");
const permission_1 = require("../../../common/helpers/types/permission");
class PageIdDto {
}
exports.PageIdDto = PageIdDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PageIdDto.prototype, "pageId", void 0);
class RestrictPageDto extends PageIdDto {
}
exports.RestrictPageDto = RestrictPageDto;
class AddPagePermissionDto extends PageIdDto {
}
exports.AddPagePermissionDto = AddPagePermissionDto;
__decorate([
    (0, class_validator_1.IsEnum)(permission_1.PagePermissionRole),
    __metadata("design:type", String)
], AddPagePermissionDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(25, {
        message: 'userIds must be an array with no more than 25 elements',
    }),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], AddPagePermissionDto.prototype, "userIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(25, {
        message: 'groupIds must be an array with no more than 25 elements',
    }),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], AddPagePermissionDto.prototype, "groupIds", void 0);
class RemovePagePermissionDto extends PageIdDto {
}
exports.RemovePagePermissionDto = RemovePagePermissionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(25, {
        message: 'userIds must be an array with no more than 25 elements',
    }),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], RemovePagePermissionDto.prototype, "userIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(25, {
        message: 'groupIds must be an array with no more than 25 elements',
    }),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], RemovePagePermissionDto.prototype, "groupIds", void 0);
class UpdatePagePermissionRoleDto extends PageIdDto {
}
exports.UpdatePagePermissionRoleDto = UpdatePagePermissionRoleDto;
__decorate([
    (0, class_validator_1.IsEnum)(permission_1.PagePermissionRole),
    __metadata("design:type", String)
], UpdatePagePermissionRoleDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdatePagePermissionRoleDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdatePagePermissionRoleDto.prototype, "groupId", void 0);
class RemovePageRestrictionDto extends PageIdDto {
}
exports.RemovePageRestrictionDto = RemovePageRestrictionDto;
//# sourceMappingURL=page-permission.dto.js.map