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
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const nestjs_kysely_1 = require("nestjs-kysely");
const workspace_repo_1 = require("../../../database/repos/workspace/workspace.repo");
const utils_1 = require("../../../database/utils");
let BillingService = BillingService_1 = class BillingService {
    constructor(environmentService, db, workspaceRepo) {
        this.environmentService = environmentService;
        this.db = db;
        this.workspaceRepo = workspaceRepo;
        this.logger = new common_1.Logger(BillingService_1.name);
        if (this.environmentService.isCloud()) {
            this.stripe = new stripe_1.default(this.environmentService.getStripeSecretKey(), {});
        }
    }
    async eventPayload(payload, signature) {
        let event = null;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, this.environmentService.getStripeWebhookSecret());
        }
        catch (err) {
            this.logger.error({ err }, 'Stripe webhook error');
            throw new common_1.BadRequestException();
        }
        return event;
    }
    async getBillingInfo(workspaceId) {
        const billing = await this.db
            .selectFrom('billing')
            .selectAll()
            .where('workspaceId', '=', workspaceId)
            .where('status', '!=', 'canceled')
            .limit(1)
            .executeTakeFirst();
        if (!billing || billing.status === 'incomplete_expired') {
            return;
        }
        return billing;
    }
    async getCheckoutLink(opts) {
        if (await this.hasActiveSubscription(opts.workspaceId)) {
            return await this.getBillingPortalLink(opts.stripeCustomerId, opts.returnUrl);
        }
        const quantity = opts.quantity ||
            (await this.workspaceRepo.getActiveUserCount(opts.workspaceId));
        let checkoutSession = null;
        try {
            checkoutSession = await this.stripe.checkout.sessions.create({
                mode: 'subscription',
                customer: opts.stripeCustomerId,
                line_items: [
                    {
                        price: opts.priceId,
                        quantity: quantity,
                    },
                ],
                subscription_data: {
                    metadata: {
                        workspaceId: opts.workspaceId,
                    },
                },
                metadata: {
                    workspaceId: opts.workspaceId,
                },
                payment_method_collection: 'always',
                allow_promotion_codes: true,
                success_url: opts.returnUrl + '/settings/billing',
                cancel_url: opts.returnUrl + '/settings/billing',
            });
        }
        catch (err) {
            this.logger.error({ err }, 'Checkout error');
            throw new common_1.BadRequestException('Failed to generate checkout link');
        }
        return { url: checkoutSession.url };
    }
    async getBillingPortalLink(stripeCustomerId, returnUrl) {
        let billingPortal = null;
        try {
            billingPortal = await this.stripe.billingPortal.sessions.create({
                customer: stripeCustomerId,
                return_url: returnUrl + '/settings/billing',
            });
        }
        catch (err) {
            this.logger.error({ err }, 'Billing portal error');
            throw new common_1.BadRequestException('Failed to generate billing portal link');
        }
        return { url: billingPortal.url };
    }
    async createStripeCustomer(workspaceId, workspaceName, billingEmail) {
        let customerId;
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            const workspace = await trx
                .selectFrom('workspaces')
                .select(['id', 'stripeCustomerId'])
                .where('id', '=', workspaceId)
                .forUpdate()
                .executeTakeFirst();
            if (!workspace) {
                throw new common_1.NotFoundException('Workspace not found');
            }
            if (workspace.stripeCustomerId) {
                customerId = workspace.stripeCustomerId;
            }
            try {
                const customer = await this.stripe.customers.create({
                    name: workspaceName,
                    email: billingEmail,
                    metadata: {
                        workspaceId: workspaceId,
                    },
                });
                customerId = customer.id;
                await this.workspaceRepo.updateWorkspace({ stripeCustomerId: customer.id, billingEmail: billingEmail }, workspaceId, trx);
            }
            catch (err) {
                this.logger.error({ err }, 'Failed to create stripe customer');
                throw new common_1.BadRequestException('Failed to create stripe customer');
            }
        });
        return customerId;
    }
    async hasActiveSubscription(workspaceId) {
        let { count } = await this.db
            .selectFrom('billing')
            .select((eb) => eb.fn.count('id').as('count'))
            .where('workspaceId', '=', workspaceId)
            .where('status', '!=', 'canceled')
            .where('status', '!=', 'incomplete_expired')
            .executeTakeFirst();
        count = count;
        return count != 0;
    }
    async updateSubscriptionQuantity(opts) {
        const { stripeSubId, stripeItemId, quantity: subQuantity } = opts;
        try {
            const subscription = await this.stripe.subscriptions.retrieve(stripeSubId, {
                expand: ['items.data.price.tiers'],
            });
            const subscriptionItem = subscription.items.data[0];
            const price = subscriptionItem.price;
            const isTiered = price.billing_scheme === 'tiered';
            const updateParams = {
                items: [
                    {
                        id: stripeItemId,
                        quantity: subQuantity,
                    },
                ],
            };
            if (isTiered) {
                updateParams.proration_behavior = 'always_invoice';
                this.logger.debug(`Enabling proration for tiered subscription ${stripeSubId} with quantity ${subQuantity}`);
            }
            await this.stripe.subscriptions.update(stripeSubId, updateParams);
        }
        catch (err) {
            this.logger.error({ err }, 'Failed to update subscription quantity');
            throw err;
        }
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService, Object, workspace_repo_1.WorkspaceRepo])
], BillingService);
//# sourceMappingURL=billing.service.js.map