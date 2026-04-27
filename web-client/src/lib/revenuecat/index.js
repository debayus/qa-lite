import { Purchases, PurchasesError, ErrorCode } from '@revenuecat/purchases-js';
export function initRevenueCat(userId) {
    const key = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
    if (!key)
        return;
    try {
        Purchases.configure(key, userId);
    }
    catch (e) {
        console.warn('RevenueCat init failed:', e);
    }
}
export async function getEntitlement() {
    try {
        const info = await Purchases.getSharedInstance().getCustomerInfo();
        return info.entitlements.active['pro'] !== undefined ? 'pro' : 'free';
    }
    catch {
        return 'free';
    }
}
export async function getOfferings() {
    try {
        return await Purchases.getSharedInstance().getOfferings();
    }
    catch {
        return null;
    }
}
export async function executePurchase(pkg) {
    try {
        await Purchases.getSharedInstance().purchase({ rcPackage: pkg });
        return 'success';
    }
    catch (e) {
        if (e instanceof PurchasesError && e.errorCode === ErrorCode.UserCancelledError) {
            return 'cancelled';
        }
        return 'error';
    }
}
