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
exports.UpdateSsoProviderDto = exports.SsoProviderIdDto = exports.CreateSsoProviderDto = void 0;
const class_validator_1 = require("class-validator");
const constants_1 = require("../constants");
const class_transformer_1 = require("class-transformer");
class CreateSsoProviderDto {
}
exports.CreateSsoProviderDto = CreateSsoProviderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(64),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsIn)([
        constants_1.SSO_PROVIDER.SAML,
        constants_1.SSO_PROVIDER.OIDC,
        constants_1.SSO_PROVIDER.GOOGLE,
        constants_1.SSO_PROVIDER.LDAP,
    ]),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({ require_protocol: true, require_tld: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.SAML),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "samlUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.SAML),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "samlCertificate", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({ require_protocol: true, require_tld: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.OIDC),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "oidcIssuer", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.OIDC),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "oidcClientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.OIDC),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "oidcClientSecret", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({
        require_protocol: true,
        protocols: ['ldap', 'ldaps'],
        require_tld: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.LDAP),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "ldapUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.LDAP),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "ldapBindDn", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.LDAP),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "ldapBindPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.LDAP),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "ldapBaseDn", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.LDAP),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "ldapUserSearchFilter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.LDAP),
    __metadata("design:type", Object)
], CreateSsoProviderDto.prototype, "ldapUserAttributes", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.LDAP),
    __metadata("design:type", Boolean)
], CreateSsoProviderDto.prototype, "ldapTlsEnabled", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === constants_1.SSO_PROVIDER.LDAP),
    __metadata("design:type", String)
], CreateSsoProviderDto.prototype, "ldapTlsCaCert", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSsoProviderDto.prototype, "allowSignup", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSsoProviderDto.prototype, "isEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSsoProviderDto.prototype, "groupSync", void 0);
class SsoProviderIdDto {
}
exports.SsoProviderIdDto = SsoProviderIdDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SsoProviderIdDto.prototype, "providerId", void 0);
class UpdateSsoProviderDto extends SsoProviderIdDto {
}
exports.UpdateSsoProviderDto = UpdateSsoProviderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(64),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({ require_protocol: true, require_tld: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "samlUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "samlCertificate", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({ require_protocol: true, require_tld: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "oidcIssuer", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "oidcClientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "oidcClientSecret", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({
        require_protocol: true,
        protocols: ['ldap', 'ldaps'],
        require_tld: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "ldapUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "ldapBindDn", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "ldapBindPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "ldapBaseDn", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "ldapUserSearchFilter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateSsoProviderDto.prototype, "ldapUserAttributes", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSsoProviderDto.prototype, "ldapTlsEnabled", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSsoProviderDto.prototype, "ldapTlsCaCert", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSsoProviderDto.prototype, "allowSignup", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSsoProviderDto.prototype, "isEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSsoProviderDto.prototype, "groupSync", void 0);
//# sourceMappingURL=sso.dto.js.map