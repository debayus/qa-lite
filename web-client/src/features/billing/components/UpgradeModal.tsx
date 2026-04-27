import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import { getOfferings, executePurchase, getEntitlement } from "@/lib/revenuecat";
import { useAuth } from "@/hooks/useAuth";
import type { Package } from "@revenuecat/purchases-js";

interface Props {
  onClose: () => void;
}

const PERIOD_LABEL: Record<string, string> = {
  $rc_monthly: "/ month",
  $rc_annual: "/ year",
  $rc_weekly: "/ week",
  $rc_lifetime: "one-time",
};

export default function UpgradeModal({ onClose }: Props) {
  const { updateEntitlement } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOfferings().then((offerings) => {
      setPackages(offerings?.current?.availablePackages ?? []);
      setLoadingOfferings(false);
    });
  }, []);

  async function handlePurchase(pkg: Package) {
    setPurchasingId(pkg.identifier);
    setError(null);

    const outcome = await executePurchase(pkg);

    if (outcome === "success") {
      const newEntitlement = await getEntitlement();
      updateEntitlement(newEntitlement);
      onClose();
    } else if (outcome === "error") {
      setError("Purchase failed. Please try again.");
    }
    // 'cancelled' → user closed RevenueCat's payment form, do nothing

    setPurchasingId(null);
  }

  return (
    <Modal
      title="Upgrade to Pro"
      subtitle="Unlock unlimited projects, members, and test cases"
      onClose={onClose}
    >
      {loadingOfferings && (
        <p className="text-sm text-gray-400 text-center py-6">
          Loading plans…
        </p>
      )}

      {!loadingOfferings && packages.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-6">
          No plans available at the moment. Please try again later.
        </p>
      )}

      {!loadingOfferings && packages.length > 0 && (
        <div className="space-y-3">
          {packages.map((pkg) => {
            const product = pkg.rcBillingProduct;
            const periodLabel =
              PERIOD_LABEL[pkg.identifier] ??
              PERIOD_LABEL[pkg.packageType] ??
              "";
            const isPurchasing = purchasingId === pkg.identifier;
            const isAnyPurchasing = purchasingId !== null;

            return (
              <div
                key={pkg.identifier}
                className="flex items-center justify-between gap-4 border border-gray-200 rounded-xl p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {product.title}
                  </p>
                  <p className="text-indigo-700 font-bold text-base mt-0.5">
                    {product.currentPrice.formattedPrice}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      {periodLabel}
                    </span>
                  </p>
                  {product.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isAnyPurchasing}
                  className="shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isPurchasing ? "Processing…" : "Subscribe"}
                </button>
              </div>
            );
          })}

          {error && (
            <p className="text-xs text-red-600 text-center pt-1">{error}</p>
          )}
        </div>
      )}
    </Modal>
  );
}
