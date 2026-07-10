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
exports.DeleteRowsDto = exports.ReorderRowDto = exports.GroupCountsDto = exports.CountRowsDto = exports.ListRowsDto = exports.RowIdDto = exports.DeleteRowDto = exports.UpdateRowDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const engine_1 = require("../engine");
const base_id_schemas_1 = require("../base-id.schemas");
class UpdateRowDto {
}
exports.UpdateRowDto = UpdateRowDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateRowDto.prototype, "rowId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateRowDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateRowDto.prototype, "cells", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateRowDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRowDto.prototype, "requestId", void 0);
class DeleteRowDto {
}
exports.DeleteRowDto = DeleteRowDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DeleteRowDto.prototype, "rowId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DeleteRowDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteRowDto.prototype, "requestId", void 0);
class RowIdDto {
}
exports.RowIdDto = RowIdDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RowIdDto.prototype, "rowId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RowIdDto.prototype, "pageId", void 0);
class SortDto {
}
__decorate([
    (0, class_validator_1.Matches)(base_id_schemas_1.PROPERTY_ID_REGEX),
    __metadata("design:type", String)
], SortDto.prototype, "propertyId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], SortDto.prototype, "direction", void 0);
class ListRowsDto {
}
exports.ListRowsDto = ListRowsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ListRowsDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ListRowsDto.prototype, "filter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(engine_1.MAX_SORTS),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SortDto),
    __metadata("design:type", Array)
], ListRowsDto.prototype, "sorts", void 0);
class CountRowsDto {
}
exports.CountRowsDto = CountRowsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CountRowsDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CountRowsDto.prototype, "filter", void 0);
class GroupCountsDto {
}
exports.GroupCountsDto = GroupCountsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GroupCountsDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.Matches)(base_id_schemas_1.PROPERTY_ID_REGEX),
    __metadata("design:type", String)
], GroupCountsDto.prototype, "groupByPropertyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GroupCountsDto.prototype, "filter", void 0);
class ReorderRowDto {
}
exports.ReorderRowDto = ReorderRowDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReorderRowDto.prototype, "rowId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReorderRowDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReorderRowDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReorderRowDto.prototype, "requestId", void 0);
class DeleteRowsDto {
}
exports.DeleteRowsDto = DeleteRowsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DeleteRowsDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(500),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], DeleteRowsDto.prototype, "rowIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteRowsDto.prototype, "requestId", void 0);
//# sourceMappingURL=update-row.dto.js.map