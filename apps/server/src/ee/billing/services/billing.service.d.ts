import Stripe from 'stripe';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { KyselyDB } from "../../../database/types/kysely.types";
import { Billing } from "../../../database/types/entity.types";
import { WorkspaceRepo } from "../../../database/repos/workspace/workspace.repo";
export declare class BillingService {
    private environmentService;
    private readonly db;
    private readonly workspaceRepo;
    private readonly logger;
    private readonly stripe;
    constructor(environmentService: EnvironmentService, db: KyselyDB, workspaceRepo: WorkspaceRepo);
    eventPayload(payload: any, signature: string | string[]): Promise<Stripe.Event>;
    getBillingInfo(workspaceId: string): Promise<Billing>;
    getCheckoutLink(opts: {
        workspaceId: string;
        stripeCustomerId: string;
        priceId: string;
        returnUrl: string;
        quantity?: number;
    }): Promise<{
        url: string;
    }>;
    getBillingPortalLink(stripeCustomerId: string, returnUrl: string): Promise<{
        url: string;
    }>;
    createStripeCustomer(workspaceId: string, workspaceName: string, billingEmail: string): Promise<string>;
    hasActiveSubscription(workspaceId: string): Promise<boolean>;
    updateSubscriptionQuantity(opts: {
        stripeSubId: string;
        stripeItemId: string;
        quantity: number;
    }): Promise<void>;
}
