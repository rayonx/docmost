"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestampToDate = timestampToDate;
exports.getPlanNameByProductId = getPlanNameByProductId;
exports.getTierInfo = getTierInfo;
const constants_1 = require("./constants");
function timestampToDate(timestamp) {
    if (!timestamp) {
        return null;
    }
    return new Date(timestamp * 1000);
}
function getPlanNameByProductId(stripeProductId) {
    const allPlans = (0, constants_1.getAllBillingPlans)();
    return (allPlans?.find((plan) => plan?.productId === stripeProductId)?.name.toLowerCase() || 'standard'.toLowerCase());
}
function getTierInfo(price, quantity) {
    if (!price.tiers || price.tiers.length === 0) {
        return {
            upTo: null,
            flatAmount: null,
            unitAmount: null,
            calculatedAmount: 0,
            tier: null,
        };
    }
    const sortedTiers = [...price.tiers].sort((a, b) => {
        if (a.up_to === null)
            return 1;
        if (b.up_to === null)
            return -1;
        return a.up_to - b.up_to;
    });
    let tier = sortedTiers[sortedTiers.length - 1];
    for (const t of sortedTiers) {
        if (t.up_to !== null && quantity <= t.up_to) {
            tier = t;
            break;
        }
    }
    let calculatedAmount = 0;
    if (tier.flat_amount !== null && tier.flat_amount !== undefined) {
        calculatedAmount = tier.flat_amount;
    }
    else if (tier.unit_amount !== null && tier.unit_amount !== undefined) {
        calculatedAmount = tier.unit_amount * quantity;
    }
    return {
        upTo: tier.up_to,
        flatAmount: tier.flat_amount,
        unitAmount: tier.unit_amount,
        calculatedAmount,
        tier,
    };
}
//# sourceMappingURL=billing.utils.js.map