import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import { getOfferings, executePurchase, getEntitlement } from "@/lib/revenuecat";
import { useAuth } from "@/hooks/useAuth";
const PERIOD_LABEL = {
    $rc_monthly: "/ month",
    $rc_annual: "/ year",
    $rc_weekly: "/ week",
    $rc_lifetime: "one-time",
};
export default function UpgradeModal({ onClose }) {
    const { updateEntitlement } = useAuth();
    const [packages, setPackages] = useState([]);
    const [loadingOfferings, setLoadingOfferings] = useState(true);
    const [purchasingId, setPurchasingId] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        getOfferings().then((offerings) => {
            setPackages(offerings?.current?.availablePackages ?? []);
            setLoadingOfferings(false);
        });
    }, []);
    async function handlePurchase(pkg) {
        setPurchasingId(pkg.identifier);
        setError(null);
        const outcome = await executePurchase(pkg);
        if (outcome === "success") {
            const newEntitlement = await getEntitlement();
            updateEntitlement(newEntitlement);
            onClose();
        }
        else if (outcome === "error") {
            setError("Purchase failed. Please try again.");
        }
        // 'cancelled' → user closed RevenueCat's payment form, do nothing
        setPurchasingId(null);
    }
    return (_jsxs(Modal, { title: "Upgrade to Pro", subtitle: "Unlock unlimited projects, members, and test cases", onClose: onClose, children: [loadingOfferings && (_jsx("p", { className: "text-sm text-gray-400 text-center py-6", children: "Loading plans\u2026" })), !loadingOfferings && packages.length === 0 && (_jsx("p", { className: "text-sm text-gray-500 text-center py-6", children: "No plans available at the moment. Please try again later." })), !loadingOfferings && packages.length > 0 && (_jsxs("div", { className: "space-y-3", children: [packages.map((pkg) => {
                        const product = pkg.rcBillingProduct;
                        const periodLabel = PERIOD_LABEL[pkg.identifier] ??
                            PERIOD_LABEL[pkg.packageType] ??
                            "";
                        const isPurchasing = purchasingId === pkg.identifier;
                        const isAnyPurchasing = purchasingId !== null;
                        return (_jsxs("div", { className: "flex items-center justify-between gap-4 border border-gray-200 rounded-xl p-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "font-semibold text-gray-900 text-sm", children: product.title }), _jsxs("p", { className: "text-indigo-700 font-bold text-base mt-0.5", children: [product.currentPrice.formattedPrice, _jsx("span", { className: "text-xs font-normal text-gray-400 ml-1", children: periodLabel })] }), product.description && (_jsx("p", { className: "text-xs text-gray-400 mt-0.5 line-clamp-2", children: product.description }))] }), _jsx("button", { onClick: () => handlePurchase(pkg), disabled: isAnyPurchasing, className: "shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors", children: isPurchasing ? "Processing…" : "Subscribe" })] }, pkg.identifier));
                    }), error && (_jsx("p", { className: "text-xs text-red-600 text-center pt-1", children: error }))] }))] }));
}
