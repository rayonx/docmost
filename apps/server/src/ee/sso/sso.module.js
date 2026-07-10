"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SsoModule = void 0;
const common_1 = require("@nestjs/common");
const sso_service_1 = require("./services/sso.service");
const passport_1 = require("@nestjs/passport");
const google_strategy_1 = require("./strategies/google.strategy");
const token_module_1 = require("../../core/auth/token.module");
const google_controller_1 = require("./controllers/google.controller");
const saml_controller_1 = require("./controllers/saml.controller");
const oidc_controller_1 = require("./controllers/oidc.controller");
const exchange_controller_1 = require("./controllers/exchange.controller");
const oidc_service_1 = require("./services/oidc.service");
const saml_service_1 = require("./services/saml.service");
const saml_strategy_1 = require("./strategies/saml.strategy");
const exchange_service_1 = require("./services/exchange.service");
const google_sso_service_1 = require("./services/google-sso.service");
const sso_controller_1 = require("./controllers/sso.controller");
const manage_sso_service_1 = require("./services/manage-sso.service");
const workspace_module_1 = require("../../core/workspace/workspace.module");
const license_module_1 = require("../licence/license.module");
const ldap_controller_1 = require("./controllers/ldap.controller");
const ldap_service_1 = require("./services/ldap.service");
const mfa_module_1 = require("../mfa/mfa.module");
let SsoModule = class SsoModule {
};
exports.SsoModule = SsoModule;
exports.SsoModule = SsoModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            sso_controller_1.SsoController,
            google_controller_1.GoogleController,
            saml_controller_1.SamlController,
            oidc_controller_1.OidcController,
            exchange_controller_1.ExchangeController,
            ldap_controller_1.LdapController,
        ],
        providers: [
            sso_service_1.SsoService,
            manage_sso_service_1.ManageSsoService,
            exchange_service_1.ExchangeService,
            oidc_service_1.OidcService,
            saml_service_1.SamlService,
            google_sso_service_1.GoogleSsoService,
            google_strategy_1.GoogleStrategy,
            saml_strategy_1.SamlStrategy,
            ldap_service_1.LdapService,
        ],
        imports: [
            passport_1.PassportModule,
            token_module_1.TokenModule,
            workspace_module_1.WorkspaceModule,
            license_module_1.LicenseModule,
            mfa_module_1.MfaModule,
        ],
        exports: [manage_sso_service_1.ManageSsoService, exchange_service_1.ExchangeService],
    })
], SsoModule);
//# sourceMappingURL=sso.module.js.map