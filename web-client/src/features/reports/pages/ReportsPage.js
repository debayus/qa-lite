import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useBugs } from "@/features/bugs/hooks/useBugs";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { generateCSV, downloadCSV } from "@/lib/utils/csv";
import PageHeader from "@/components/common/PageHeader";
import { BUG_STATUS_LABEL } from "@/constants";
import { ChartBarIcon, BugAntIcon, CheckCircleIcon, ArrowDownTrayIcon, } from "@/components/ui/Icons";
const BUG_STATUS_ORDER = [
    "open",
    "in_progress",
    "resolved",
    "closed",
];
const SEVERITY_ORDER = ["critical", "major", "minor", "trivial"];
const STATUS_BAR_COLOR = {
    open: "bg-red-400",
    in_progress: "bg-yellow-400",
    resolved: "bg-blue-400",
    closed: "bg-gray-300",
};
const STATUS_BADGE_COLOR = {
    open: "bg-red-50 text-red-600",
    in_progress: "bg-yellow-50 text-yellow-700",
    resolved: "bg-blue-50 text-blue-600",
    closed: "bg-gray-100 text-gray-500",
};
export default function ReportsPage() {
    const { projectId } = useParams();
    const { project } = useProject(projectId);
    const { bugs } = useBugs(projectId);
    const { user } = useAuth();
    const isPro = user?.entitlement === "pro";
    const totalTC = project?.stats.totalTestCases ?? 0;
    const passed = project?.stats.passedTestCases ?? 0;
    const passRate = totalTC > 0 ? Math.round((passed / totalTC) * 100) : 0;
    const openBugs = bugs.filter((b) => b.status === "open").length;
    const resolvedBugs = bugs.filter((b) => b.status === "resolved" || b.status === "closed").length;
    const healthLabel = passRate >= 90
        ? "Excellent"
        : passRate >= 75
            ? "Good"
            : passRate >= 50
                ? "Needs Attention"
                : "Critical";
    const healthGradient = passRate >= 90
        ? "from-green-600 to-green-500"
        : passRate >= 75
            ? "from-yellow-500 to-yellow-400"
            : "from-red-600 to-red-500";
    function exportCSV() {
        const headers = [
            "title",
            "description",
            "severity",
            "status",
            "reportedBy",
        ];
        const rows = bugs.map((b) => [
            b.title,
            b.description,
            b.severity,
            b.status,
            b.reportedBy,
        ]);
        const csv = generateCSV(headers, rows);
        const safeName = (project?.name ?? "project")
            .replace(/[^a-zA-Z0-9]/g, "-")
            .toLowerCase();
        downloadCSV(`bugs-report-${safeName}.csv`, csv);
    }
    function exportPDF() {
        window.print();
    }
    return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsx(PageHeader, { title: "Reports & Analytics", action: isPro ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: exportCSV, className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors", children: [_jsx(ArrowDownTrayIcon, { className: "w-3.5 h-3.5" }), "Export CSV"] }), _jsxs("button", { onClick: exportPDF, className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors", children: [_jsx(ArrowDownTrayIcon, { className: "w-3.5 h-3.5" }), "Export PDF"] })] })) : (_jsxs("a", { href: "/billing", className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors", children: [_jsx(ArrowDownTrayIcon, { className: "w-3.5 h-3.5" }), "Export (Pro)"] })) }), _jsxs("div", { className: cn("bg-gradient-to-r rounded-2xl p-5 text-white shadow-md", healthGradient), children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white/70 text-xs font-medium mb-1", children: "Project Health" }), _jsxs("p", { className: "text-3xl font-bold", children: [passRate, "%"] }), _jsx("p", { className: "text-white/80 text-sm mt-0.5", children: healthLabel })] }), _jsx("div", { className: "w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0", children: _jsx(ChartBarIcon, { className: "w-5 h-5 text-white" }) })] }), _jsx("div", { className: "mt-4 h-2 bg-white/20 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-white/80 rounded-full transition-all", style: { width: `${passRate}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs text-white/70 mt-1.5", children: [_jsxs("span", { children: [passed, " passed"] }), _jsxs("span", { children: [totalTC, " total test cases"] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { className: "bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center", children: [_jsx("p", { className: "text-2xl font-bold text-gray-800", children: totalTC }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Test Cases" })] }), _jsxs("div", { className: "bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center", children: [_jsx("p", { className: "text-2xl font-bold text-red-500", children: openBugs }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Open Bugs" })] }), _jsxs("div", { className: "bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center", children: [_jsx("p", { className: "text-2xl font-bold text-green-500", children: resolvedBugs }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Resolved" })] })] }), _jsxs("section", { className: "bg-white border border-gray-100 rounded-xl p-5 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(BugAntIcon, { className: "w-4 h-4 text-gray-400" }), _jsx("h2", { className: "text-sm font-semibold text-gray-700", children: "Bug Status Distribution" })] }), _jsx("div", { className: "space-y-3", children: BUG_STATUS_ORDER.map((status) => {
                            const count = bugs.filter((b) => b.status === status).length;
                            const pct = bugs.length > 0 ? Math.round((count / bugs.length) * 100) : 0;
                            return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "w-24 text-xs text-gray-600 shrink-0", children: BUG_STATUS_LABEL[status] }), _jsx("div", { className: "flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: cn("h-full rounded-full transition-all", STATUS_BAR_COLOR[status]), style: { width: `${pct}%` } }) }), _jsx("span", { className: cn("shrink-0 min-w-[28px] text-center text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_BADGE_COLOR[status]), children: count })] }, status));
                        }) }), bugs.length === 0 && (_jsx("p", { className: "text-center text-xs text-gray-300 py-4", children: "No bugs reported yet." }))] }), _jsxs("section", { className: "bg-white border border-gray-100 rounded-xl p-5 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(CheckCircleIcon, { className: "w-4 h-4 text-gray-400" }), _jsx("h2", { className: "text-sm font-semibold text-gray-700", children: "Bug Severity Breakdown" })] }), _jsx("div", { className: "space-y-3", children: SEVERITY_ORDER.map((sev) => {
                            const count = bugs.filter((b) => b.severity === sev).length;
                            const pct = bugs.length > 0 ? Math.round((count / bugs.length) * 100) : 0;
                            const barColor = sev === "critical"
                                ? "bg-red-500"
                                : sev === "major"
                                    ? "bg-orange-400"
                                    : sev === "minor"
                                        ? "bg-yellow-400"
                                        : "bg-gray-300";
                            const badgeColor = sev === "critical"
                                ? "bg-red-50 text-red-600"
                                : sev === "major"
                                    ? "bg-orange-50 text-orange-600"
                                    : sev === "minor"
                                        ? "bg-yellow-50 text-yellow-700"
                                        : "bg-gray-100 text-gray-500";
                            return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "w-16 text-xs text-gray-600 capitalize shrink-0", children: sev }), _jsx("div", { className: "flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: cn("h-full rounded-full transition-all", barColor), style: { width: `${pct}%` } }) }), _jsx("span", { className: cn("shrink-0 min-w-[28px] text-center text-xs font-semibold px-2 py-0.5 rounded-full", badgeColor), children: count })] }, sev));
                        }) }), bugs.length === 0 && (_jsx("p", { className: "text-center text-xs text-gray-300 py-4", children: "No bugs reported yet." }))] })] }));
}
