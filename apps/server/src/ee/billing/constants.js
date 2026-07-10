"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIERED_BILLING_PLANS = exports.BILLING_PLANS = exports.BILLING_SCHEME_TYPE = void 0;
exports.getActiveBillingPlans = getActiveBillingPlans;
exports.getAllBillingPlans = getAllBillingPlans;
exports.BILLING_SCHEME_TYPE = process.env.BILLING_SCHEME_TYPE || 'per_unit';
exports.BILLING_PLANS = [
    {
        name: 'Standard',
        description: '',
        productId: process.env.STRIPE_STANDARD_PRODUCT_ID,
        monthlyId: process.env.STRIPE_STANDARD_MONTHLY_ID || '',
        yearlyId: process.env.STRIPE_STANDARD_YEARLY_ID || '',
        currency: 'USD',
        price: {
            monthly: '8',
            yearly: '72',
        },
        features: [
            'Realtime collaboration',
            'Unlimited spaces',
            'Diagrams',
            'Comments',
            'Groups & permissions',
            '90-day page history',
            'Google SSO',
            'Email support',
        ],
        billingScheme: 'per_unit',
        isActive: true,
    },
];
exports.TIERED_BILLING_PLANS = [
    {
        name: 'Standard',
        description: '',
        productId: process.env.STRIPE_STANDARD_TIERED_PRODUCT_ID ||
            process.env.STRIPE_STANDARD_PRODUCT_ID,
        monthlyId: process.env.STRIPE_STANDARD_TIERED_MONTHLY_ID ||
            process.env.STRIPE_STANDARD_MONTHLY_ID ||
            '',
        yearlyId: process.env.STRIPE_STANDARD_TIERED_YEARLY_ID ||
            process.env.STRIPE_STANDARD_YEARLY_ID ||
            '',
        currency: 'USD',
        features: [
            'Realtime collaboration',
            'Unlimited spaces',
            'Diagrams',
            'Comments',
            'Groups & permissions',
            '90-day page history',
            'Google SSO',
            'Email support',
        ],
        billingScheme: 'tiered',
        pricingTiers: [
            { upTo: 10, monthly: 12, yearly: 120 },
            { upTo: 50, monthly: 49, yearly: 490 },
            { upTo: 100, monthly: 89, yearly: 890 },
            { upTo: 200, monthly: 169, yearly: 1690 },
            { upTo: 300, monthly: 240, yearly: 2400 },
            { upTo: 301, custom: true },
        ],
        isActive: true,
    },
];
function getActiveBillingPlans() {
    const plans = exports.BILLING_SCHEME_TYPE === 'tiered' ? exports.TIERED_BILLING_PLANS : exports.BILLING_PLANS;
    return plans.filter((plan) => plan.isActive);
}
function getAllBillingPlans() {
    return [...exports.TIERED_BILLING_PLANS, ...exports.BILLING_PLANS];
}
//# sourceMappingURL=constants.js.map