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
var BillingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./services/billing.service");
const subscription_handler_service_1 = require("./services/subscription.handler.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const workspace_ability_factory_1 = require("../../core/casl/abilities/workspace-ability.factory");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const workspace_ability_type_1 = require("../../core/casl/interfaces/workspace-ability.type");
const billing_dto_1 = require("./dto/billing.dto");
const constants_1 = require("./constants");
const cloud_access_guard_1 = require("../guards/cloud-access.guard");
let BillingController = BillingController_1 = class BillingController {
    constructor(billingService, billingHandlerService, workspaceAbility) {
        this.billingService = billingService;
        this.billingHandlerService = billingHandlerService;
        this.workspaceAbility = workspaceAbility;
        this.logger = new common_1.Logger(BillingController_1.name);
    }
    async handleWebhook(req) {
        const signature = req.headers['stripe-signature'];
        const eventPayload = await this.billingService.eventPayload(req.rawBody, signature);
        switch (eventPayload.type) {
            case 'customer.subscription.created':
                this.logger.debug('Customer subscription created');
                await this.billingHandlerService.handleSubscriptionCreated(eventPayload.data);
                break;
            case 'customer.subscription.updated':
                this.logger.debug('Customer subscription updated');
                await this.billingHandlerService.handleSubscriptionUpdated(eventPayload.data);
                break;
            case 'customer.subscription.deleted':
                this.logger.debug('Customer subscription deleted');
                await this.billingHandlerService.handleSubscriptionCanceled(eventPayload.data);
                break;
            case 'customer.updated':
                this.logger.debug('Customer updated');
                await this.billingHandlerService.handleCustomerUpdated(eventPayload.data);
                break;
        }
    }
    async billingInfo(user, workspace) {
        await this.permissionCheck(user, workspace);
        return this.billingService.getBillingInfo(workspace.id);
    }
    async checkout(checkoutDto, user, workspace, req) {
        await this.permissionCheck(user, workspace);
        const returnUrl = req.protocol + '://' + req.hostname;
        let stripeCustomerId = null;
        if (workspace.stripeCustomerId) {
            stripeCustomerId = workspace.stripeCustomerId;
        }
        else {
            stripeCustomerId = await this.billingService.createStripeCustomer(workspace.id, workspace.name || user.name, user.email);
        }
        return this.billingService.getCheckoutLink({
            workspaceId: workspace.id,
            stripeCustomerId,
            priceId: checkoutDto.priceId,
            returnUrl,
        });
    }
    async billingPortal(user, workspace, req) {
        await this.permissionCheck(user, workspace);
        const returnUrl = req.protocol + '://' + req.hostname;
        if (!workspace.stripeCustomerId) {
            throw new common_1.NotFoundException('Stripe customer not found');
        }
        return this.billingService.getBillingPortalLink(workspace.stripeCustomerId, returnUrl);
    }
    async billingPlans() {
        return (0, constants_1.getActiveBillingPlans)();
    }
    async billingPlansGet() {
        return (0, constants_1.getActiveBillingPlans)();
    }
    async permissionCheck(user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Settings)) {
            throw new common_1.ForbiddenException();
        }
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('stripe/webhook'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('info'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "billingInfo", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [billing_dto_1.CheckoutDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "checkout", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('portal'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "billingPortal", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "billingPlans", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "billingPlansGet", null);
exports.BillingController = BillingController = BillingController_1 = __decorate([
    (0, common_1.UseGuards)(cloud_access_guard_1.CloudAccessGuard),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService,
        subscription_handler_service_1.SubscriptionHandlerService,
        workspace_ability_factory_1.default])
], BillingController);
//# sourceMappingURL=billing.controller.js.map