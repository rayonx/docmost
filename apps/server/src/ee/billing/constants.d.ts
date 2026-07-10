export declare const BILLING_SCHEME_TYPE: string;
export declare const BILLING_PLANS: {
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
}[];
export declare const TIERED_BILLING_PLANS: {
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
}[];
export declare function getActiveBillingPlans(): ({
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
})[];
export declare function getAllBillingPlans(): ({
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
})[];
