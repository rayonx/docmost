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
exports.ExchangeController = void 0;
const common_1 = require("@nestjs/common");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const auth_workspace_decorator_1 = require("../../../common/decorators/auth-workspace.decorator");
const exchange_service_1 = require("../services/exchange.service");
const sso_utils_1 = require("../sso.utils");
let ExchangeController = class ExchangeController {
    constructor(exchangeService, environmentService) {
        this.exchangeService = exchangeService;
        this.environmentService = environmentService;
    }
    async exchange(res, workspace, exchangeToken, redirect) {
        if (!exchangeToken) {
            throw new common_1.BadRequestException('Exchange token param is required');
        }
        const authToken = await this.exchangeService.handleExchangeToken(exchangeToken, workspace.id);
        res.setCookie('authToken', authToken, {
            httpOnly: true,
            path: '/',
            expires: this.environmentService.getCookieExpiresIn(),
            secure: this.environmentService.isHttps(),
        });
        const safe = (0, sso_utils_1.safeRedirectPath)(redirect);
        res.redirect(safe ?? '/home', 301);
    }
};
exports.ExchangeController = ExchangeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(2, (0, common_1.Query)('token')),
    __param(3, (0, common_1.Query)('redirect')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], ExchangeController.prototype, "exchange", null);
exports.ExchangeController = ExchangeController = __decorate([
    (0, common_1.Controller)('auth/exchange'),
    __metadata("design:paramtypes", [exchange_service_1.ExchangeService,
        environment_service_1.EnvironmentService])
], ExchangeController);
//# sourceMappingURL=exchange.controller.js.map