import Stripe from 'stripe';
export declare function timestampToDate(timestamp: number): Date;
export declare function getPlanNameByProductId(stripeProductId: string): string;
export declare function getTierInfo(price: Stripe.Price, quantity: number): {
    upTo: number;
    flatAmount: number;
    unitAmount: number;
    calculatedAmount: number;
    tier: Stripe.Price.Tier;
};
