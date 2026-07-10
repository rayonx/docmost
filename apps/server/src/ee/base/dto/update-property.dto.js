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
exports.ReorderPropertyDto = exports.DeletePropertyDto = exports.UpdatePropertyDto = void 0;
const class_validator_1 = require("class-validator");
const property_type_registry_1 = require("../property-types/property-type.registry");
const base_id_schemas_1 = require("../base-id.schemas");
class UpdatePropertyDto {
}
exports.UpdatePropertyDto = UpdatePropertyDto;
__decorate([
    (0, class_validator_1.Matches)(base_id_schemas_1.PROPERTY_ID_REGEX),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "propertyId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(property_type_registry_1.USER_PROPERTY_TYPES),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdatePropertyDto.prototype, "typeOptions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "requestId", void 0);
class DeletePropertyDto {
}
exports.DeletePropertyDto = DeletePropertyDto;
__decorate([
    (0, class_validator_1.Matches)(base_id_schemas_1.PROPERTY_ID_REGEX),
    __metadata("design:type", String)
], DeletePropertyDto.prototype, "propertyId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DeletePropertyDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeletePropertyDto.prototype, "requestId", void 0);
class ReorderPropertyDto {
}
exports.ReorderPropertyDto = ReorderPropertyDto;
__decorate([
    (0, class_validator_1.Matches)(base_id_schemas_1.PROPERTY_ID_REGEX),
    __metadata("design:type", String)
], ReorderPropertyDto.prototype, "propertyId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReorderPropertyDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReorderPropertyDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReorderPropertyDto.prototype, "requestId", void 0);
//# sourceMappingURL=update-property.dto.js.map