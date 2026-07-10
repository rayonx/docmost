import { RawBodyRequest } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { BillingService } from "./services/billing.service";
import { SubscriptionHandlerService } from "./services/subscription.handler.service";
import WorkspaceAbilityFactory from '../../core/casl/abilities/workspace-ability.factory';
import { User, Workspace } from "../../database/types/entity.types";
import { CheckoutDto } from "./dto/billing.dto";
export declare class BillingController {
    private readonly billingService;
    private readonly billingHandlerService;
    private readonly workspaceAbility;
    private readonly logger;
    constructor(billingService: BillingService, billingHandlerService: SubscriptionHandlerService, workspaceAbility: WorkspaceAbilityFactory);
    handleWebhook(req: RawBodyRequest<FastifyRequest>): Promise<void>;
    billingInfo(user: User, workspace: Workspace): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        metadata: import("../../database/types/db").JsonValue;
        status: string;
        stripeCustomerId: string;
        amount: string;
        billingScheme: string;
        cancelAt: Date;
        cancelAtPeriodEnd: boolean;
        canceledAt: Date;
        currency: string;
        endedAt: Date;
        interval: string;
        periodEndAt: Date;
        periodStartAt: Date;
        planName: string;
        quantity: string;
        stripeItemId: string;
        stripePriceId: string;
        stripeProductId: string;
        stripeSubscriptionId: string;
        tieredFlatAmount: string;
        tieredUnitAmount: string;
        tieredUpTo: string;
    }>;
    checkout(checkoutDto: CheckoutDto, user: User, workspace: Workspace, req: FastifyRequest): Promise<{
        url: string;
    }>;
    billingPortal(user: User, workspace: Workspace, req: FastifyRequest): Promise<{
        url: string;
    }>;
    billingPlans(): Promise<({
        name: string;
        description: string;
        productId: string;
        monthlyId: string;
        yearlyId: string;
        currency: string;
        price: {
            monthly: string;
            yearly: string;
        };
        features: string[];
        billingScheme: string;
        isActive: boolean;
    } | {
        name: string;
        description: string;
        productId: string;
        monthlyId: string;
        yearlyId: string;
        currency: string;
        features: string[];
        billingScheme: string;
        pricingTiers: ({
            upTo: number;
            monthly: number;
            yearly: number;
            custom?: undefined;
        } | {
            upTo: number;
            custom: boolean;
            monthly?: undefined;
            yearly?: undefined;
        })[];
        isActive: boolean;
    })[]>;
    billingPlansGet(): Promise<({
        name: string;
        description: string;
        productId: string;
        monthlyId: string;
        yearlyId: string;
        currency: string;
        price: {
            monthly: string;
            yearly: string;
        };
        features: string[];
        billingScheme: string;
        isActive: boolean;
    } | {
        name: string;
        description: string;
        productId: string;
        monthlyId: string;
        yearlyId: string;
        currency: string;
        features: string[];
        billingScheme: string;
        pricingTiers: ({
            upTo: number;
            monthly: number;
            yearly: number;
            custom?: undefined;
        } | {
            upTo: number;
            custom: boolean;
            monthly?: undefined;
            yearly?: undefined;
        })[];
        isActive: boolean;
    })[]>;
    permissionCheck(user: User, workspace: Workspace): Promise<void>;
}
