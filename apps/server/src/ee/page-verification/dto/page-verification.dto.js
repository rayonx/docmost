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
exports.ListVerificationsDto = exports.ObsoletePageDto = exports.RejectApprovalDto = exports.SubmitForApprovalDto = exports.RemoveVerificationDto = exports.VerifyPageDto = exports.UpdateVerificationDto = exports.SetupVerificationDto = exports.PageVerificationPageIdDto = exports.PERIOD_AMOUNT_ABSOLUTE_MAX = exports.PERIOD_UNIT_MAX_AMOUNT = exports.PERIOD_AMOUNT_MIN = exports.PERIOD_UNIT_DAYS = exports.PeriodUnit = exports.ExpirationMode = exports.QmsStatus = exports.VerificationType = void 0;
const class_validator_1 = require("class-validator");
var VerificationType;
(function (VerificationType) {
    VerificationType["EXPIRING"] = "expiring";
    VerificationType["QMS"] = "qms";
})(VerificationType || (exports.VerificationType = VerificationType = {}));
var QmsStatus;
(function (QmsStatus) {
    QmsStatus["DRAFT"] = "draft";
    QmsStatus["IN_APPROVAL"] = "in_approval";
    QmsStatus["APPROVED"] = "approved";
    QmsStatus["OBSOLETE"] = "obsolete";
})(QmsStatus || (exports.QmsStatus = QmsStatus = {}));
var ExpirationMode;
(function (ExpirationMode) {
    ExpirationMode["PERIOD"] = "period";
    ExpirationMode["FIXED"] = "fixed";
    ExpirationMode["INDEFINITE"] = "indefinite";
})(ExpirationMode || (exports.ExpirationMode = ExpirationMode = {}));
var PeriodUnit;
(function (PeriodUnit) {
    PeriodUnit["DAY"] = "day";
    PeriodUnit["WEEK"] = "week";
    PeriodUnit["MONTH"] = "month";
    PeriodUnit["YEAR"] = "year";
})(PeriodUnit || (exports.PeriodUnit = PeriodUnit = {}));
exports.PERIOD_UNIT_DAYS = {
    [PeriodUnit.DAY]: 1,
    [PeriodUnit.WEEK]: 7,
    [PeriodUnit.MONTH]: 30,
    [PeriodUnit.YEAR]: 365,
};
exports.PERIOD_AMOUNT_MIN = 1;
exports.PERIOD_UNIT_MAX_AMOUNT = {
    [PeriodUnit.DAY]: 3650,
    [PeriodUnit.WEEK]: 520,
    [PeriodUnit.MONTH]: 120,
    [PeriodUnit.YEAR]: 20,
};
exports.PERIOD_AMOUNT_ABSOLUTE_MAX = 3650;
class PageVerificationPageIdDto {
}
exports.PageVerificationPageIdDto = PageVerificationPageIdDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PageVerificationPageIdDto.prototype, "pageId", void 0);
class SetupVerificationDto {
}
exports.SetupVerificationDto = SetupVerificationDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SetupVerificationDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(VerificationType),
    __metadata("design:type", String)
], SetupVerificationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ExpirationMode),
    __metadata("design:type", String)
], SetupVerificationDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(exports.PERIOD_AMOUNT_MIN),
    (0, class_validator_1.Max)(exports.PERIOD_AMOUNT_ABSOLUTE_MAX),
    __metadata("design:type", Number)
], SetupVerificationDto.prototype, "periodAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PeriodUnit),
    __metadata("design:type", String)
], SetupVerificationDto.prototype, "periodUnit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SetupVerificationDto.prototype, "fixedExpiresAt", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one verifier is required' }),
    (0, class_validator_1.ArrayMaxSize)(5, { message: 'Maximum of 5 verifiers allowed' }),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], SetupVerificationDto.prototype, "verifierIds", void 0);
class UpdateVerificationDto {
}
exports.UpdateVerificationDto = UpdateVerificationDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateVerificationDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ExpirationMode),
    __metadata("design:type", String)
], UpdateVerificationDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(exports.PERIOD_AMOUNT_MIN),
    (0, class_validator_1.Max)(exports.PERIOD_AMOUNT_ABSOLUTE_MAX),
    __metadata("design:type", Number)
], UpdateVerificationDto.prototype, "periodAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PeriodUnit),
    __metadata("design:type", String)
], UpdateVerificationDto.prototype, "periodUnit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateVerificationDto.prototype, "fixedExpiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one verifier is required' }),
    (0, class_validator_1.ArrayMaxSize)(5, { message: 'Maximum of 5 verifiers allowed' }),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], UpdateVerificationDto.prototype, "verifierIds", void 0);
class VerifyPageDto {
}
exports.VerifyPageDto = VerifyPageDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], VerifyPageDto.prototype, "pageId", void 0);
class RemoveVerificationDto {
}
exports.RemoveVerificationDto = RemoveVerificationDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RemoveVerificationDto.prototype, "pageId", void 0);
class SubmitForApprovalDto {
}
exports.SubmitForApprovalDto = SubmitForApprovalDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubmitForApprovalDto.prototype, "pageId", void 0);
class RejectApprovalDto {
}
exports.RejectApprovalDto = RejectApprovalDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RejectApprovalDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RejectApprovalDto.prototype, "comment", void 0);
class ObsoletePageDto {
}
exports.ObsoletePageDto = ObsoletePageDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ObsoletePageDto.prototype, "pageId", void 0);
class ListVerificationsDto {
}
exports.ListVerificationsDto = ListVerificationsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], ListVerificationsDto.prototype, "spaceIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ListVerificationsDto.prototype, "verifierId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(VerificationType),
    __metadata("design:type", String)
], ListVerificationsDto.prototype, "type", void 0);
//# sourceMappingURL=page-verification.dto.js.map