import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useScenarios } from "@/features/scenarios/hooks/useScenarios";
import { useTestCases } from "@/features/test-cases/hooks/useTestCases";
import { useTestRuns } from "../hooks/useTestRuns";
import { useFullRuns } from "../hooks/useFullRuns";
import { useBugs } from "@/features/bugs/hooks/useBugs";
import BugReportModal from "../components/BugReportModal";
import CreateRunModal from "../components/CreateRunModal";
import RunHistoryCard from "../components/RunHistoryCard";
import FullRunHistoryCard from "../components/FullRunHistoryCard";
import { cn } from "@/lib/utils/cn";
import { TEST_STATUS_COLOR, INPUT_CLASS, BTN_PRIMARY } from "@/constants";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils/formatDate";
// ─── Static helpers ──────────────────────────────────────────────────────────
const STATUS_BUTTONS = [
    {
        label: "Pass",
        status: "passed",
        color: "bg-green-600 hover:bg-green-700 text-white",
    },
    {
        label: "Fail",
        status: "failed",
        color: "bg-red-600 hover:bg-red-700 text-white",
    },
    {
        label: "Blocked",
        status: "blocked",
        color: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    {
        label: "Skip",
        status: "skipped",
        color: "bg-gray-400 hover:bg-gray-500 text-white",
    },
];
function TestCaseItem({ tcId, result, onStatus, onNoteBlur, }) {
    const [note, setNote] = useState(result.note ?? "");
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: result.title }), result.status !== "untested" && (_jsx("span", { className: cn("text-[11px] font-semibold rounded-full px-2.5 py-0.5 shrink-0 capitalize", TEST_STATUS_COLOR[result.status] ?? "bg-gray-100 text-gray-600"), children: result.status }))] }), _jsx("div", { className: "grid grid-cols-4 gap-1.5", children: STATUS_BUTTONS.map(({ label, status, color }) => (_jsx("button", { onClick: () => onStatus(tcId, status), className: cn("py-2 text-xs font-semibold rounded-lg transition-all", result.status === status
                        ? color + " ring-2 ring-offset-1 ring-gray-300 scale-95"
                        : color + " opacity-70 hover:opacity-100"), children: label }, status))) }), result.status !== "untested" && (_jsx("input", { type: "text", value: note, onChange: (e) => setNote(e.target.value), onBlur: () => onNoteBlur(tcId, note), placeholder: "Note (optional)...", className: "w-full text-xs rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50" }))] }));
}
function RunSummaryBar({ passed, failed, blocked, skipped, untested, total, }) {
    const done = total - untested;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return (_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex justify-between text-xs text-gray-500", children: [_jsxs("span", { children: [done, " / ", total, " done"] }), _jsxs("span", { className: "font-medium text-indigo-600", children: ["Pass ", passRate, "%"] })] }), _jsx("div", { className: "h-2 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-indigo-500 rounded-full transition-all duration-300", style: { width: `${progress}%` } }) }), _jsxs("div", { className: "flex gap-3 text-[11px] text-gray-400 pt-0.5", children: [_jsxs("span", { className: "text-green-600", children: ["\u2713 ", passed, " pass"] }), _jsxs("span", { className: "text-red-600", children: ["\u2717 ", failed, " fail"] }), _jsxs("span", { className: "text-orange-500", children: ["\u2298 ", blocked, " blocked"] }), _jsxs("span", { children: ["\u2014 ", skipped, " skip"] }), untested > 0 && (_jsxs("span", { className: "ml-auto text-gray-300", children: [untested, " untested"] }))] })] }));
}
const FILTER_CHIPS = [
    {
        label: "Untested",
        value: "untested",
        activeClass: "bg-gray-900 text-white border-gray-900",
    },
    {
        label: "Tested",
        value: "tested",
        activeClass: "bg-gray-600 text-white border-gray-600",
    },
    {
        label: "Pass",
        value: "passed",
        activeClass: "bg-green-600 text-white border-green-600",
    },
    {
        label: "Fail",
        value: "failed",
        activeClass: "bg-red-600 text-white border-red-600",
    },
    {
        label: "Blocked",
        value: "blocked",
        activeClass: "bg-orange-500 text-white border-orange-500",
    },
    {
        label: "Skip",
        value: "skipped",
        activeClass: "bg-gray-400 text-white border-gray-400",
    },
    {
        label: "All",
        value: "all",
        activeClass: "bg-indigo-600 text-white border-indigo-600",
    },
];
function matchesFilter(status, filter) {
    if (filter === "all")
        return true;
    if (filter === "tested")
        return status !== "untested";
    return status === filter;
}
export default function ExecutionPage() {
    const { projectId } = useParams();
    const { scenarios } = useScenarios(projectId);
    // ── Run mode ──────────────────────────────────────────────────────────────
    const [runMode, setRunMode] = useState("all");
    // ── Single-scenario state ─────────────────────────────────────────────────
    const [selectedScenarioId, setSelectedScenarioId] = useState("");
    const { testCases } = useTestCases(projectId, selectedScenarioId || undefined);
    const { activeRun, completedRuns, createRun, updateResult: updateSingleResult, completeRun, deleteRun, } = useTestRuns(projectId, selectedScenarioId || undefined);
    // ── Full-run state ────────────────────────────────────────────────────────
    const { activeFullRun, completedFullRuns, createFullRun, updateResult: updateFullResult, completeFullRun, deleteFullRun, } = useFullRuns(projectId);
    const { createBug } = useBugs(projectId);
    const [tab, setTab] = useState("active");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bugModalFor, setBugModalFor] = useState(null);
    const [completing, setCompleting] = useState(false);
    const [expandedScenarios, setExpandedScenarios] = useState({});
    const [tcFilter, setTcFilter] = useState("untested");
    const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);
    const nextRunNumber = completedRuns.length + (activeRun ? 1 : 0) + 1;
    const nextFullRunNumber = completedFullRuns.length + (activeFullRun ? 1 : 0) + 1;
    function toggleScenarioSection(scId) {
        setExpandedScenarios((prev) => ({ ...prev, [scId]: !prev[scId] }));
    }
    // ── Single-scenario handlers ───────────────────────────────────────────────
    async function handleSingleStatus(tcId, status) {
        if (!activeRun)
            return;
        await updateSingleResult(activeRun.id, tcId, status);
        if (status === "failed") {
            const result = activeRun.results[tcId];
            setBugModalFor({ id: tcId, title: result?.title ?? "" });
        }
    }
    async function handleSingleNoteBlur(tcId, note) {
        if (!activeRun)
            return;
        await updateSingleResult(activeRun.id, tcId, activeRun.results[tcId].status, note);
    }
    async function handleCompleteRun() {
        if (!activeRun)
            return;
        setCompleting(true);
        try {
            await completeRun(activeRun.id);
            setTab("history");
        }
        finally {
            setCompleting(false);
        }
    }
    async function handleCreateSingleRun(name) {
        if (!selectedScenarioId || !selectedScenario)
            return;
        await createRun(selectedScenarioId, selectedScenario.title, testCases, name);
        setShowCreateModal(false);
    }
    // ── Full-run handlers ─────────────────────────────────────────────────────
    async function handleFullStatus(scenarioId, tcId, status) {
        if (!activeFullRun)
            return;
        await updateFullResult(activeFullRun.id, scenarioId, tcId, status);
        if (status === "failed") {
            const result = activeFullRun.scenarioRuns[scenarioId]?.results[tcId];
            setBugModalFor({ id: tcId, title: result?.title ?? "" });
        }
    }
    async function handleFullNoteBlur(scenarioId, tcId, note) {
        if (!activeFullRun)
            return;
        const currentStatus = activeFullRun.scenarioRuns[scenarioId]?.results[tcId]?.status ??
            "untested";
        await updateFullResult(activeFullRun.id, scenarioId, tcId, currentStatus, note);
    }
    async function handleCompleteFullRun() {
        if (!activeFullRun)
            return;
        setCompleting(true);
        try {
            await completeFullRun(activeFullRun.id);
            setTab("history");
        }
        finally {
            setCompleting(false);
        }
    }
    async function handleCreateFullRun(name) {
        await createFullRun(name, scenarios);
        setShowCreateModal(false);
        // Expand all scenarios by default
        const expanded = {};
        scenarios.forEach((s) => (expanded[s.id] = true));
        setExpandedScenarios(expanded);
    }
    // ── Derived data ──────────────────────────────────────────────────────────
    const fullOverall = activeFullRun?.overallSummary;
    const filterBar = (_jsx("div", { className: "flex gap-1.5 overflow-x-auto pb-0.5", children: FILTER_CHIPS.map(({ label, value, activeClass }) => (_jsx("button", { onClick: () => setTcFilter(value), className: cn("shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors", tcFilter === value
                ? activeClass
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"), children: label }, value))) }));
    const activeResults = activeRun ? Object.entries(activeRun.results) : [];
    const total = activeResults.length;
    const passed = activeResults.filter(([, r]) => r.status === "passed").length;
    const failed = activeResults.filter(([, r]) => r.status === "failed").length;
    const blocked = activeResults.filter(([, r]) => r.status === "blocked").length;
    const skipped = activeResults.filter(([, r]) => r.status === "skipped").length;
    const untested = activeResults.filter(([, r]) => r.status === "untested").length;
    return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsx(PageHeader, { title: "Test Execution", subtitle: "Run and record test execution results" }), _jsxs("div", { className: "flex gap-1 bg-gray-100 rounded-xl p-1", children: [_jsxs("button", { onClick: () => {
                            setRunMode("all");
                            setTab("active");
                        }, className: cn("flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors", runMode === "all"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"), children: ["Run All Scenarios", activeFullRun && (_jsx("span", { className: "ml-1.5 inline-block w-2 h-2 rounded-full bg-indigo-500 align-middle" }))] }), _jsxs("button", { onClick: () => {
                            setRunMode("scenario");
                            setTab("active");
                        }, className: cn("flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors", runMode === "scenario"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"), children: ["By Scenario", activeRun && (_jsx("span", { className: "ml-1.5 inline-block w-2 h-2 rounded-full bg-indigo-500 align-middle" }))] })] }), runMode === "all" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-1 bg-gray-100 rounded-xl p-1", children: [_jsxs("button", { onClick: () => setTab("active"), className: cn("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", tab === "active"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"), children: ["Active Run", activeFullRun && (_jsx("span", { className: "ml-1.5 inline-block w-2 h-2 rounded-full bg-indigo-500 align-middle" }))] }), _jsxs("button", { onClick: () => setTab("history"), className: cn("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", tab === "history"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"), children: ["History", completedFullRuns.length > 0 && (_jsxs("span", { className: "ml-1.5 text-xs text-gray-400", children: ["(", completedFullRuns.length, ")"] }))] })] }), tab === "active" && (_jsx("div", { className: "space-y-4", children: !activeFullRun ? (_jsx(EmptyState, { paddingY: "py-12", title: "No active run", description: scenarios.length === 0
                                ? "Add scenarios and test cases first before running."
                                : "Create a full run to execute all scenarios at once.", action: scenarios.length > 0 ? (_jsx("button", { onClick: () => setShowCreateModal(true), className: BTN_PRIMARY, children: "+ Create Full Run" })) : undefined })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: activeFullRun.name }), _jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: ["Started ", formatDate(activeFullRun.createdAt), " · ", Object.keys(activeFullRun.scenarioRuns).length, " ", "scenario"] })] }), _jsx("span", { className: "text-xs bg-indigo-100 text-indigo-700 font-medium px-2.5 py-1 rounded-full", children: "In Progress" })] }), fullOverall && fullOverall.total > 0 && (_jsx(RunSummaryBar, { passed: fullOverall.passed, failed: fullOverall.failed, blocked: fullOverall.blocked, skipped: fullOverall.skipped, untested: fullOverall.untested, total: fullOverall.total }))] }), filterBar, _jsx("div", { className: "space-y-3", children: (activeFullRun.scenarioOrder ??
                                        Object.keys(activeFullRun.scenarioRuns))
                                        .filter((scId) => scId in activeFullRun.scenarioRuns)
                                        .map((scId) => {
                                        const scData = activeFullRun.scenarioRuns[scId];
                                        const isOpen = expandedScenarios[scId] ?? true;
                                        const scSummary = scData.summary;
                                        const scDone = scSummary.total - scSummary.untested;
                                        const filteredResults = Object.entries(scData.results).filter(([, r]) => matchesFilter(r.status, tcFilter));
                                        if (filteredResults.length === 0)
                                            return null;
                                        return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-xl overflow-hidden", children: [_jsxs("button", { onClick: () => toggleScenarioSection(scId), className: "w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900 truncate", children: scData.scenarioTitle }), _jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [scDone, " / ", scSummary.total, " done"] })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [scSummary.untested === 0 && (_jsx("span", { className: "text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium", children: "Done" })), _jsx("span", { className: "text-gray-400 text-xs", children: isOpen ? "▲" : "▼" })] })] }), isOpen && (_jsx("div", { className: "border-t border-gray-100 p-3 space-y-2", children: filteredResults.map(([tcId, result]) => (_jsx(TestCaseItem, { tcId: tcId, result: result, onStatus: (id, status) => handleFullStatus(scId, id, status), onNoteBlur: (id, note) => handleFullNoteBlur(scId, id, note) }, tcId))) }))] }, scId));
                                    }) }), _jsx("button", { onClick: handleCompleteFullRun, disabled: completing, className: "w-full py-3 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors", children: completing ? "Saving..." : "Complete Full Run" })] })) })), tab === "history" && (_jsx("div", { className: "space-y-3", children: completedFullRuns.length === 0 ? (_jsx(EmptyState, { paddingY: "py-12", title: "No run history yet", description: "History will appear after you complete the first full run." })) : (completedFullRuns.map((run) => (_jsx(FullRunHistoryCard, { run: run, onDelete: () => deleteFullRun(run.id) }, run.id)))) }))] })), runMode === "scenario" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-4", children: [_jsx("label", { className: "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "Select Scenario" }), _jsxs("select", { value: selectedScenarioId, onChange: (e) => {
                                    setSelectedScenarioId(e.target.value);
                                    setTab("active");
                                }, className: INPUT_CLASS, children: [_jsx("option", { value: "", children: "-- Select a scenario --" }), scenarios.map((s) => (_jsx("option", { value: s.id, children: s.title }, s.id)))] })] }), selectedScenarioId && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-1 bg-gray-100 rounded-xl p-1", children: [_jsxs("button", { onClick: () => setTab("active"), className: cn("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", tab === "active"
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"), children: ["Active Run", activeRun && (_jsx("span", { className: "ml-1.5 inline-block w-2 h-2 rounded-full bg-indigo-500 align-middle" }))] }), _jsxs("button", { onClick: () => setTab("history"), className: cn("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", tab === "history"
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"), children: ["History", completedRuns.length > 0 && (_jsxs("span", { className: "ml-1.5 text-xs text-gray-400", children: ["(", completedRuns.length, ")"] }))] })] }), tab === "active" && (_jsx("div", { className: "space-y-4", children: !activeRun ? (_jsx(EmptyState, { paddingY: "py-12", title: "No active run", description: "Create a new run to start executing test cases for this scenario.", action: _jsx("button", { onClick: () => setShowCreateModal(true), disabled: testCases.length === 0, className: BTN_PRIMARY, children: "+ Create New Run" }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: activeRun.name }), _jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: ["Started ", formatDate(activeRun.createdAt)] })] }), _jsx("span", { className: "text-xs bg-indigo-100 text-indigo-700 font-medium px-2.5 py-1 rounded-full", children: "In Progress" })] }), total > 0 && (_jsx(RunSummaryBar, { passed: passed, failed: failed, blocked: blocked, skipped: skipped, untested: untested, total: total }))] }), filterBar, _jsx("div", { className: "space-y-3", children: activeResults
                                                .filter(([, r]) => matchesFilter(r.status, tcFilter))
                                                .map(([tcId, result]) => (_jsx(TestCaseItem, { tcId: tcId, result: result, onStatus: handleSingleStatus, onNoteBlur: handleSingleNoteBlur }, tcId))) }), _jsx("button", { onClick: handleCompleteRun, disabled: completing, className: "w-full py-3 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors", children: completing ? "Saving..." : "Complete Run" })] })) })), tab === "history" && (_jsx("div", { className: "space-y-3", children: completedRuns.length === 0 ? (_jsx(EmptyState, { paddingY: "py-12", title: "No run history yet", description: "History will appear after you complete the first execution." })) : (completedRuns.map((run) => (_jsx(RunHistoryCard, { run: run, onDelete: () => deleteRun(run.id) }, run.id)))) }))] }))] })), showCreateModal && runMode === "all" && (_jsx(CreateRunModal, { defaultName: `Full Run #${nextFullRunNumber}`, onSubmit: handleCreateFullRun, onClose: () => setShowCreateModal(false) })), showCreateModal && runMode === "scenario" && (_jsx(CreateRunModal, { defaultName: `Run #${nextRunNumber}`, onSubmit: handleCreateSingleRun, onClose: () => setShowCreateModal(false) })), bugModalFor && (_jsx(BugReportModal, { testCase: bugModalFor, onSubmit: createBug, onClose: () => setBugModalFor(null) }))] }));
}
