import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { STARTER_LIMITS, BTN_SUBMIT } from "@/constants";
import PageHeader from "@/components/common/PageHeader";
import UpgradeModal from "../components/UpgradeModal";
import { useBillingUsage } from "../hooks/useBillingUsage";
function UsageRow({ label, used, limit, unit, }) {
    const pct = used !== null ? Math.min(Math.round((used / limit) * 100), 100) : 0;
    const atLimit = used !== null && used >= limit;
    return (_jsxs("div", { className: "px-5 py-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-gray-700 font-medium", children: label }), _jsxs("span", { className: cn("text-xs font-semibold", atLimit ? "text-red-600" : "text-gray-500"), children: [used === null ? "…" : used, " / ", limit, " ", _jsxs("span", { className: "font-normal text-gray-400", children: [unit, "s"] })] })] }), _jsx("div", { className: "h-1.5 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: cn("h-full rounded-full transition-all", atLimit
                        ? "bg-red-500"
                        : pct >= 75
                            ? "bg-amber-400"
                            : "bg-indigo-500"), style: { width: `${pct}%` } }) })] }));
}
export default function BillingPage() {
    const { user } = useAuth();
    const isPro = user?.entitlement === "pro";
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { projectCount, memberCount, testCasesThisMonth, cycleLabel, loading: usageLoading, } = useBillingUsage();
    const features = [
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
    return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsx(PageHeader, { title: "Billing & Subscription", subtitle: isPro ? "Active plan: Pro" : "Active plan: Starter (Free)" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: cn("border rounded-xl overflow-hidden", !isPro
                            ? "border-indigo-300 ring-2 ring-indigo-100"
                            : "border-gray-200"), children: [_jsxs("div", { className: "bg-gray-50 px-5 pt-5 pb-4 border-b border-gray-100", children: [_jsx("h2", { className: "text-sm font-semibold text-gray-500 uppercase tracking-wide", children: "Starter" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-1", children: "Free" }), _jsx("p", { className: "text-xs text-gray-400", children: "forever" })] }), _jsx("div", { className: "p-5", children: !isPro && (_jsx("span", { className: "inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 font-semibold", children: "\u2713 Paket Anda" })) })] }), _jsxs("div", { className: cn("border rounded-xl overflow-hidden", isPro
                            ? "border-indigo-400 ring-2 ring-indigo-100"
                            : "border-gray-200"), children: [_jsxs("div", { className: "bg-indigo-600 px-5 pt-5 pb-4", children: [_jsx("h2", { className: "text-sm font-semibold text-indigo-200 uppercase tracking-wide", children: "Pro" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: "$12" }), _jsx("p", { className: "text-xs text-indigo-300", children: "per team / month" })] }), _jsx("div", { className: "p-5", children: isPro ? (_jsx("span", { className: "inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 font-semibold", children: "\u2713 Your Plan" })) : (_jsx("button", { onClick: () => setShowUpgradeModal(true), className: BTN_SUBMIT, children: "Upgrade to Pro \u2192" })) })] })] }), !isPro && (_jsxs("div", { className: "border border-gray-200 rounded-xl overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-5 py-3 border-b border-gray-100", children: _jsxs("h2", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: ["Usage \u2014 ", cycleLabel] }) }), _jsxs("div", { className: "divide-y divide-gray-100", children: [_jsx(UsageRow, { label: "Projects", used: usageLoading ? null : projectCount, limit: STARTER_LIMITS.maxProjects, unit: "project" }), _jsx(UsageRow, { label: "Team Members", used: usageLoading ? null : memberCount, limit: STARTER_LIMITS.maxMembers, unit: "member" }), _jsx(UsageRow, { label: "Test Cases (this month)", used: usageLoading ? null : testCasesThisMonth, limit: STARTER_LIMITS.maxTestCasesPerMonth, unit: "test case" })] })] })), _jsx("div", { className: "border border-gray-200 rounded-xl overflow-hidden", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50 border-b border-gray-100", children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-500", children: "Feature" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-semibold text-gray-500", children: "Starter" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-semibold text-indigo-600", children: "Pro" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: features.map((f) => (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-4 py-3 text-gray-700 font-medium", children: f.label }), _jsx("td", { className: "px-4 py-3 text-center text-gray-400", children: f.starter }), _jsx("td", { className: "px-4 py-3 text-center text-indigo-700 font-semibold", children: f.pro })] }, f.label))) })] }) }), showUpgradeModal && (_jsx(UpgradeModal, { onClose: () => setShowUpgradeModal(false) }))] }));
}
