import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { STARTER_LIMITS, BTN_SUBMIT } from "@/constants";
import PageHeader from "@/components/common/PageHeader";
import UpgradeModal from "../components/UpgradeModal";
import { useBillingUsage } from "../hooks/useBillingUsage";

function UsageRow({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number | null;
  limit: number;
  unit: string;
}) {
  const pct =
    used !== null ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  const atLimit = used !== null && used >= limit;
  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-700 font-medium">{label}</span>
        <span
          className={cn(
            "text-xs font-semibold",
            atLimit ? "text-red-600" : "text-gray-500",
          )}
        >
          {used === null ? "…" : used} / {limit}{" "}
          <span className="font-normal text-gray-400">{unit}s</span>
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            atLimit
              ? "bg-red-500"
              : pct >= 75
                ? "bg-amber-400"
                : "bg-indigo-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const isPro = user?.entitlement === "pro";
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const {
    projectCount,
    memberCount,
    testCasesThisMonth,
    cycleLabel,
    loading: usageLoading,
  } = useBillingUsage();

  const features: { label: string; starter: string; pro: string }[] = [
    { label: "Active Projects", starter: "1 project", pro: "Unlimited" },
    {
      label: "Team Members",
      starter: `${STARTER_LIMITS.maxMembers} members`,
      pro: "10 (+$2/extra)",
    },
    {
      label: "Test Cases",
      starter: `${STARTER_LIMITS.maxTestCasesPerMonth}/month`,
      pro: "Unlimited",
    },
    {
      label: "Storage",
      starter: `${STARTER_LIMITS.storageMB} MB`,
      pro: "10 GB",
    },
    { label: "Export Reports", starter: "Basic analytics", pro: "PDF & CSV" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Billing & Subscription"
        subtitle={isPro ? "Active plan: Pro" : "Active plan: Starter (Free)"}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Starter */}
        <div
          className={cn(
            "border rounded-xl overflow-hidden",
            !isPro
              ? "border-indigo-300 ring-2 ring-indigo-100"
              : "border-gray-200",
          )}
        >
          <div className="bg-gray-50 px-5 pt-5 pb-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Starter
            </h2>
            <p className="text-2xl font-bold text-gray-900 mt-1">Free</p>
            <p className="text-xs text-gray-400">forever</p>
          </div>
          <div className="p-5">
            {!isPro && (
              <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 font-semibold">
                ✓ Paket Anda
              </span>
            )}
          </div>
        </div>

        {/* Pro */}
        <div
          className={cn(
            "border rounded-xl overflow-hidden",
            isPro
              ? "border-indigo-400 ring-2 ring-indigo-100"
              : "border-gray-200",
          )}
        >
          <div className="bg-indigo-600 px-5 pt-5 pb-4">
            <h2 className="text-sm font-semibold text-indigo-200 uppercase tracking-wide">
              Pro
            </h2>
            <p className="text-2xl font-bold text-white mt-1">$12</p>
            <p className="text-xs text-indigo-300">per team / month</p>
          </div>
          <div className="p-5">
            {isPro ? (
              <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 font-semibold">
                ✓ Your Plan
              </span>
            ) : (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className={BTN_SUBMIT}
              >
                Upgrade to Pro →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage summary — Starter only */}
      {!isPro && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Usage — {cycleLabel}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <UsageRow
              label="Projects"
              used={usageLoading ? null : projectCount}
              limit={STARTER_LIMITS.maxProjects}
              unit="project"
            />
            <UsageRow
              label="Team Members"
              used={usageLoading ? null : memberCount}
              limit={STARTER_LIMITS.maxMembers}
              unit="member"
            />
            <UsageRow
              label="Test Cases (this month)"
              used={usageLoading ? null : testCasesThisMonth}
              limit={STARTER_LIMITS.maxTestCasesPerMonth}
              unit="test case"
            />
          </div>
        </div>
      )}

      {/* Feature Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                Feature
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                Starter
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-600">
                Pro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {features.map((f) => (
              <tr key={f.label} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-700 font-medium">
                  {f.label}
                </td>
                <td className="px-4 py-3 text-center text-gray-400">
                  {f.starter}
                </td>
                <td className="px-4 py-3 text-center text-indigo-700 font-semibold">
                  {f.pro}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
