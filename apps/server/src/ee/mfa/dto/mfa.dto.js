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
exports.RegenerateBackupCodesDto = exports.DisableMfaDto = exports.MfaDto = exports.EnableMfaDto = void 0;
const class_validator_1 = require("class-validator");
class EnableMfaDto {
}
exports.EnableMfaDto = EnableMfaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(6, 6, { message: 'Verification code must be 6 digits' }),
    __metadata("design:type", String)
], EnableMfaDto.prototype, "verificationCode", void 0);
class MfaDto {
}
exports.MfaDto = MfaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MfaDto.prototype, "code", void 0);
class DisableMfaDto {
}
exports.DisableMfaDto = DisableMfaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(70),
    __metadata("design:type", String)
], DisableMfaDto.prototype, "confirmPassword", void 0);
class RegenerateBackupCodesDto {
}
exports.RegenerateBackupCodesDto = RegenerateBackupCodesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(70),
    __metadata("design:type", String)
], RegenerateBackupCodesDto.prototype, "confirmPassword", void 0);
//# sourceMappingURL=mfa.dto.js.map