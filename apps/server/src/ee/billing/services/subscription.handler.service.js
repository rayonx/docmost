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
var SubscriptionHandlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionHandlerService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const nestjs_kysely_1 = require("nestjs-kysely");
const billing_utils_1 = require("../billing.utils");
const utils_1 = require("../../../database/utils");
const bullmq_1 = require("@nestjs/bullmq");
const constants_1 = require("../../../integrations/queue/constants");
const bullmq_2 = require("bullmq");
const environment_service_1 = require("../../../integrations/environment/environment.service");
let SubscriptionHandlerService = SubscriptionHandlerService_1 = class SubscriptionHandlerService {
    constructor(db, billingQueue, environmentService) {
        this.db = db;
        this.billingQueue = billingQueue;
        this.environmentService = environmentService;
        this.logger = new common_1.Logger(SubscriptionHandlerService_1.name);
        if (this.environmentService.isCloud()) {
            this.stripe = new stripe_1.default(this.environmentService.getStripeSecretKey(), {});
        }
    }
    async handleSubscriptionCreated(event) {
        const subscriptionData = event.object;
        const stripeCustomerId = subscriptionData.customer;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id'])
            .where('stripeCustomerId', '=', stripeCustomerId)
            .executeTakeFirst();
        if (!workspace) {
            this.logger.debug('Workspace not found for ' + stripeCustomerId);
            throw new common_1.NotFoundException('Workspace not found');
        }
        try {
            await this.billingQueue.add(constants_1.QueueJob.FIRST_PAYMENT_EMAIL, { workspaceId: workspace.id }, { delay: 60 * 1000 });
        }
        catch (err) {
        }
        await this.saveSubscription(event, workspace.id);
    }
    async handleSubscriptionUpdated(event) {
        const subscriptionData = event.object;
        const stripeCustomerId = subscriptionData.customer;
        const stripeSubscriptionId = subscriptionData.id;
        let isCreatedHere = false;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id', 'status'])
            .where('stripeCustomerId', '=', stripeCustomerId)
            .executeTakeFirst();
        if (!workspace) {
            this.logger.debug('Workspace not found for ' + stripeCustomerId);
            throw new common_1.NotFoundException('Workspace not found');
        }
        let billing = await this.findByStripeSubId(stripeSubscriptionId);
        if (!billing) {
            this.logger.error('Subscription not found in db. Saving subscription data.');
            const savedBilling = await this.saveSubscription(event, workspace.id);
            if (savedBilling) {
                billing = savedBilling;
                isCreatedHere = true;
            }
            else {
                billing = await this.findByStripeSubId(stripeSubscriptionId);
                isCreatedHere = false;
            }
        }
        if (!billing) {
            this.logger.error('Subscription still not found in db. Skipping update.');
            return;
        }
        if (billing.status === 'canceled') {
            this.logger.debug('Cannot update a canceled subscription');
            return;
        }
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            if (!isCreatedHere) {
                const subscriptionDataToUpdate = await this.calculateSubscriptionData(subscriptionData);
                await trx
                    .updateTable('billing')
                    .set({
                    ...subscriptionDataToUpdate,
                    updatedAt: new Date(),
                })
                    .where('stripeSubscriptionId', '=', billing.stripeSubscriptionId)
                    .execute();
            }
            const planName = (0, billing_utils_1.getPlanNameByProductId)(subscriptionData.items.data[0].plan.product);
            if (subscriptionData.status === 'active' &&
                workspace.status !== 'active') {
                await trx
                    .updateTable('workspaces')
                    .set({ status: 'active', plan: planName, updatedAt: new Date() })
                    .where('id', '=', workspace.id)
                    .execute();
            }
        });
    }
    async handleSubscriptionCanceled(event) {
        const subscriptionData = event.object;
        const stripeCustomerId = subscriptionData.customer;
        const stripeSubscriptionId = subscriptionData.id;
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            const workspace = await trx
                .selectFrom('workspaces')
                .select(['id', 'status'])
                .where('stripeCustomerId', '=', stripeCustomerId)
                .executeTakeFirst();
            if (!workspace) {
                this.logger.debug('Workspace not found for ' + stripeCustomerId);
                throw new common_1.NotFoundException('Workspace not found');
            }
            const billing = await trx
                .selectFrom('billing')
                .selectAll()
                .where('stripeSubscriptionId', '=', stripeSubscriptionId)
                .executeTakeFirst();
            if (!billing) {
                this.logger.error('Canceled subscription not found in db.');
                throw new common_1.NotFoundException('Canceled subscription not found in db.');
            }
            await trx
                .updateTable('billing')
                .set({
                status: subscriptionData.status,
                cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
                cancelAt: (0, billing_utils_1.timestampToDate)(subscriptionData.cancel_at),
                canceledAt: (0, billing_utils_1.timestampToDate)(subscriptionData.canceled_at),
                endedAt: (0, billing_utils_1.timestampToDate)(subscriptionData.ended_at),
                updatedAt: new Date(),
            })
                .where('id', '=', billing.id)
                .returningAll()
                .execute();
            if (subscriptionData.status === 'canceled') {
                await trx
                    .updateTable('workspaces')
                    .set({ status: 'suspended', plan: null, updatedAt: new Date() })
                    .where('id', '=', workspace.id)
                    .execute();
            }
        });
    }
    async handleCustomerUpdated(event) {
        const stripeCustomerId = event.object.id;
        const stripeCustomerEmail = event.object.email;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id', 'billingEmail'])
            .where('stripeCustomerId', '=', stripeCustomerId)
            .executeTakeFirst();
        if (!workspace) {
            this.logger.debug('Workspace not found for ' + stripeCustomerId);
            throw new common_1.NotFoundException('Workspace not found');
        }
        if (workspace.billingEmail?.toLowerCase() !==
            stripeCustomerEmail.toLowerCase()) {
            await this.db
                .updateTable('workspaces')
                .set({ billingEmail: stripeCustomerEmail })
                .where('id', '=', workspace.id)
                .execute();
        }
    }
    async saveSubscription(eventData, workspaceId, trx) {
        const db = (0, utils_1.dbOrTx)(this.db, trx);
        const subscriptionData = eventData.object;
        try {
            const subscriptionDataToInsert = await this.calculateSubscriptionData(subscriptionData);
            const workspace = await db
                .insertInto('billing')
                .values([
                {
                    ...subscriptionDataToInsert,
                    workspaceId: workspaceId,
                },
            ])
                .onConflict((oc) => oc.column('stripeSubscriptionId').doNothing())
                .returningAll()
                .executeTakeFirst();
            await db
                .updateTable('workspaces')
                .set({ trialEndAt: null, updatedAt: new Date() })
                .where('id', '=', workspaceId)
                .execute();
            return workspace;
        }
        catch (err) {
            if (err?.['code'] === '23505') {
                this.logger.error('Subscription exists - duplicate key error. Sub ID: ' +
                    subscriptionData.id);
            }
            throw err;
        }
    }
    async calculateSubscriptionData(subscriptionData) {
        const price = await this.stripe.prices.retrieve(subscriptionData.items.data[0].price.id, { expand: ['tiers'] });
        const quantity = subscriptionData.items.data[0].quantity;
        let amount = subscriptionData.items.data[0].plan.amount;
        let tieredUpTo = null;
        let tieredFlatAmount = null;
        let tieredUnitAmount = null;
        if (price.billing_scheme === 'tiered') {
            const tierInfo = (0, billing_utils_1.getTierInfo)(price, quantity);
            amount = tierInfo.calculatedAmount;
            tieredUpTo = tierInfo.upTo;
            tieredFlatAmount = tierInfo.flatAmount;
            tieredUnitAmount = tierInfo.unitAmount;
        }
        const planName = (0, billing_utils_1.getPlanNameByProductId)(subscriptionData.items.data[0].plan.product);
        return {
            stripeSubscriptionId: subscriptionData.id,
            stripeCustomerId: subscriptionData.customer,
            status: subscriptionData.status,
            quantity: quantity,
            amount: amount,
            interval: subscriptionData.items.data[0].plan.interval,
            currency: subscriptionData.items.data[0].price.currency,
            metadata: subscriptionData.metadata,
            stripePriceId: subscriptionData.items.data[0].price.id,
            stripeItemId: subscriptionData.items.data[0].id,
            stripeProductId: subscriptionData.items.data[0].plan.product,
            periodStartAt: (0, billing_utils_1.timestampToDate)(subscriptionData.current_period_start),
            periodEndAt: (0, billing_utils_1.timestampToDate)(subscriptionData.current_period_end),
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
            cancelAt: (0, billing_utils_1.timestampToDate)(subscriptionData.cancel_at),
            canceledAt: (0, billing_utils_1.timestampToDate)(subscriptionData.canceled_at),
            endedAt: (0, billing_utils_1.timestampToDate)(subscriptionData.ended_at),
            billingScheme: price.billing_scheme,
            tieredUpTo: tieredUpTo?.toString() || null,
            tieredFlatAmount: tieredFlatAmount,
            tieredUnitAmount: tieredUnitAmount,
            planName: planName,
        };
    }
    async findByStripeSubId(stripeSubscriptionId) {
        return this.db
            .selectFrom('billing')
            .selectAll()
            .where('stripeSubscriptionId', '=', stripeSubscriptionId)
            .executeTakeFirst();
    }
};
exports.SubscriptionHandlerService = SubscriptionHandlerService;
exports.SubscriptionHandlerService = SubscriptionHandlerService = SubscriptionHandlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(1, (0, bullmq_1.InjectQueue)(constants_1.QueueName.BILLING_QUEUE)),
    __metadata("design:paramtypes", [Object, bullmq_2.Queue,
        environment_service_1.EnvironmentService])
], SubscriptionHandlerService);
//# sourceMappingURL=subscription.handler.service.js.map