import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { TEST_STATUS_COLOR } from "@/constants";
import { formatDate } from "@/lib/utils/formatDate";
export default function FullRunHistoryCard({ run, onDelete }) {
    const [expandedScenarios, setExpandedScenarios] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(false);
    const s = run.overallSummary;
    const passRate = s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0;
    const scenarioEntries = (run.scenarioOrder ?? Object.keys(run.scenarioRuns))
        .filter((id) => id in run.scenarioRuns)
        .map((id) => [id, run.scenarioRuns[id]]);
    function toggleScenario(scId) {
        setExpandedScenarios((prev) => ({ ...prev, [scId]: !prev[scId] }));
    }
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-xl overflow-hidden", children: [_jsxs("div", { className: "p-4 space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900 truncate", children: run.name }), _jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [formatDate(run.completedAt), " · ", _jsxs("span", { className: "text-gray-500", children: [scenarioEntries.length, " scenario"] })] })] }), _jsxs("span", { className: cn("text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0", passRate >= 80
                                    ? "bg-green-100 text-green-700"
                                    : passRate >= 50
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"), children: [passRate, "% pass"] })] }), _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [s.passed > 0 && (_jsxs("span", { className: "text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full", children: ["\u2713 ", s.passed, " pass"] })), s.failed > 0 && (_jsxs("span", { className: "text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full", children: ["\u2717 ", s.failed, " fail"] })), s.blocked > 0 && (_jsxs("span", { className: "text-[11px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full", children: ["\u2298 ", s.blocked, " blocked"] })), s.skipped > 0 && (_jsxs("span", { className: "text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full", children: ["\u2014 ", s.skipped, " skip"] })), _jsxs("span", { className: "text-[11px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full ml-auto", children: [s.total, " test case"] })] })] }), _jsx("div", { className: "border-t border-gray-100 divide-y divide-gray-50", children: scenarioEntries.map(([scId, scData]) => {
                    const scPassRate = scData.summary.total > 0
                        ? Math.round((scData.summary.passed / scData.summary.total) * 100)
                        : 0;
                    const isOpen = expandedScenarios[scId] ?? false;
                    return (_jsxs("div", { children: [_jsxs("button", { onClick: () => toggleScenario(scId), className: "w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs font-medium text-gray-800 truncate", children: scData.scenarioTitle }), _jsxs("div", { className: "flex gap-2 mt-1", children: [scData.summary.passed > 0 && (_jsxs("span", { className: "text-[10px] text-green-600", children: ["\u2713 ", scData.summary.passed] })), scData.summary.failed > 0 && (_jsxs("span", { className: "text-[10px] text-red-600", children: ["\u2717 ", scData.summary.failed] })), scData.summary.blocked > 0 && (_jsxs("span", { className: "text-[10px] text-orange-500", children: ["\u2298 ", scData.summary.blocked] })), scData.summary.skipped > 0 && (_jsxs("span", { className: "text-[10px] text-gray-400", children: ["\u2014 ", scData.summary.skipped] }))] })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsxs("span", { className: cn("text-[11px] font-medium px-2 py-0.5 rounded-full", scPassRate >= 80
                                                    ? "bg-green-100 text-green-700"
                                                    : scPassRate >= 50
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"), children: [scPassRate, "%"] }), _jsx("span", { className: "text-gray-400 text-xs", children: isOpen ? "▲" : "▼" })] })] }), isOpen && (_jsx("div", { className: "bg-gray-50 divide-y divide-gray-100", children: Object.entries(scData.results).map(([tcId, result]) => (_jsxs("div", { className: "px-4 py-2.5 flex items-start gap-3", children: [_jsx("span", { className: cn("text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 capitalize", TEST_STATUS_COLOR[result.status] ??
                                                "bg-gray-100 text-gray-600"), children: result.status }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs text-gray-700", children: result.title }), result.note && (_jsx("p", { className: "text-[11px] text-gray-400 mt-0.5 italic", children: result.note }))] })] }, tcId))) }))] }, scId));
                }) }), _jsx("div", { className: "px-4 pb-3 pt-2 flex justify-end border-t border-gray-100", children: confirmDelete ? (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Delete this run?" }), _jsx("button", { onClick: () => setConfirmDelete(false), className: "text-xs text-gray-500 hover:text-gray-700", children: "Cancel" }), _jsx("button", { onClick: onDelete, className: "text-xs text-red-600 hover:text-red-700 font-medium", children: "Delete" })] })) : (_jsx("button", { onClick: () => setConfirmDelete(true), className: "text-xs text-gray-400 hover:text-red-500 transition-colors", children: "Delete" })) })] }));
}
