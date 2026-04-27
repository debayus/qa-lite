import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTestCases } from "../hooks/useTestCases";
import { useScenarios } from "@/features/scenarios/hooks/useScenarios";
import { useAuth } from "@/hooks/useAuth";
import { useBillingUsage } from "@/features/billing/hooks/useBillingUsage";
import TestCaseRow from "../components/TestCaseRow";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import CsvImportModal from "@/components/common/CsvImportModal";
import { projectRoutes, STARTER_LIMITS, BTN_SM_SECONDARY, BTN_SM_PRIMARY, } from "@/constants";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@/components/ui/Icons";
import { generateCSV, downloadCSV } from "@/lib/utils/csv";
const TC_CSV_HEADERS = ["title", "steps", "status"];
const TC_FORMAT_EXAMPLE = `title,steps,status
"Login dengan kredensial valid","Buka halaman login|Masukkan email|Masukkan password|Klik Login",untested
"Login dengan email kosong","Buka halaman login|Klik Login tanpa isi email",untested`;
const TC_AI_PROMPT = `Buat test case untuk scenario: [nama scenario]

Format output CSV (salin persis termasuk header):
title,steps,status
"Judul test case","Langkah 1|Langkah 2|Langkah 3",untested

Aturan:
- Pisahkan langkah dengan | (pipe), bukan enter
- status: untested / passed / failed / blocked / skipped
- Gunakan tanda kutip ganda jika judul/steps mengandung koma
- Satu test case per baris`;
const VALID_STATUSES = new Set([
    "untested",
    "passed",
    "failed",
    "blocked",
    "skipped",
]);
export default function TestCasesPage() {
    const { projectId, scenarioId } = useParams();
    const navigate = useNavigate();
    const { testCases, loading, createTestCase, bulkCreateTestCases, updateTestCase, deleteTestCase, moveTestCase, } = useTestCases(projectId, scenarioId);
    const { scenarios } = useScenarios(projectId);
    const { user } = useAuth();
    const { testCasesThisMonth } = useBillingUsage();
    const addInputRef = useRef(null);
    const [showImport, setShowImport] = useState(false);
    const isStarterLimitReached = user?.entitlement !== "pro" &&
        testCasesThisMonth >= STARTER_LIMITS.maxTestCasesPerMonth;
    const scenarioTitle = scenarios.find((s) => s.id === scenarioId)?.title ?? "Test Cases";
    async function handleAddBlur(e) {
        const val = e.target.value.trim();
        if (!val)
            return;
        if (isStarterLimitReached)
            return;
        await createTestCase(val);
        e.target.value = "";
    }
    async function handleAddKeyDown(e) {
        if (e.key !== "Enter")
            return;
        const val = e.target.value.trim();
        if (!val)
            return;
        if (isStarterLimitReached)
            return;
        await createTestCase(val);
        e.target.value = "";
    }
    function focusAddInput() {
        addInputRef.current?.focus();
    }
    function handleExport() {
        const rows = testCases.map((tc) => [
            tc.title,
            tc.steps.join("|"),
            tc.status,
        ]);
        const csv = generateCSV(TC_CSV_HEADERS, rows);
        const safeName = scenarioTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
        downloadCSV(`test-cases-${safeName}.csv`, csv);
    }
    async function handleImport(parsed) {
        if (isStarterLimitReached)
            return;
        const items = parsed.map((r) => ({
            title: r["title"],
            steps: r["steps"]
                ? r["steps"]
                    .split("|")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
            status: (VALID_STATUSES.has(r["status"])
                ? r["status"]
                : "untested"),
        }));
        await bulkCreateTestCases(items);
    }
    const passed = testCases.filter((t) => t.status === "passed").length;
    const failed = testCases.filter((t) => t.status === "failed").length;
    const total = testCases.length;
    return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsx(PageHeader, { title: scenarioTitle, subtitle: total > 0
                    ? `${passed} passed · ${failed} failed · ${total} total`
                    : undefined, action: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => navigate(projectRoutes.scenarios(projectId)), className: "text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1", children: "\u2190 Scenarios" }), total > 0 && (_jsxs("button", { onClick: handleExport, className: BTN_SM_SECONDARY, children: [_jsx(ArrowDownTrayIcon, { className: "w-3.5 h-3.5" }), "Export CSV"] })), _jsxs("button", { onClick: () => setShowImport(true), className: BTN_SM_PRIMARY, children: [_jsx(ArrowUpTrayIcon, { className: "w-3.5 h-3.5" }), "Import CSV"] })] }) }), total > 0 && (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "h-2 bg-gray-100 rounded-full overflow-hidden flex", children: [_jsx("div", { className: "h-full bg-green-500 transition-all", style: { width: `${Math.round((passed / total) * 100)}%` } }), _jsx("div", { className: "h-full bg-red-400 transition-all", style: { width: `${Math.round((failed / total) * 100)}%` } })] }), _jsxs("p", { className: "text-xs text-gray-400 text-right", children: [Math.round((passed / total) * 100), "% passed"] })] })), _jsxs("div", { className: "bg-white border border-gray-200 rounded-xl overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wide", children: [_jsx("span", { className: "w-10 shrink-0" }), _jsx("span", { className: "flex-1", children: "Test Case Title" }), _jsx("span", { className: "pr-1", children: "Status" })] }), loading ? (_jsx(LoadingState, { className: "py-8" })) : testCases.length === 0 ? (_jsx(EmptyState, { title: "No test cases yet", description: "Add your first test case below, or import from CSV.", paddingY: "py-10" })) : (testCases.map((tc, i) => (_jsx(TestCaseRow, { testCase: tc, index: i + 1, isFirst: i === 0, isLast: i === testCases.length - 1, onUpdate: updateTestCase, onDelete: deleteTestCase, onMoveUp: () => moveTestCase(tc.id, "up"), onMoveDown: () => moveTestCase(tc.id, "down"), onEnterKey: focusAddInput }, tc.id)))), _jsxs("div", { className: "flex items-center gap-2 px-3 py-2.5 border-t border-dashed border-gray-200", children: [_jsx("span", { className: "w-10 shrink-0" }), isStarterLimitReached ? (_jsxs("p", { className: "flex-1 text-xs text-amber-600", children: ["Limit reached (", STARTER_LIMITS.maxTestCasesPerMonth, " test cases).", " ", _jsx("a", { href: "/billing", className: "underline font-semibold", children: "Upgrade to Pro" }), " ", "for unlimited test cases."] })) : (_jsx("input", { ref: addInputRef, type: "text", placeholder: "Add new test case (press Enter)...", onBlur: handleAddBlur, onKeyDown: handleAddKeyDown, className: "flex-1 text-sm text-gray-500 placeholder-gray-300 bg-transparent focus:outline-none" }))] })] }), showImport && (_jsx(CsvImportModal, { title: "Import Test Cases dari CSV", headers: TC_CSV_HEADERS, defaultValues: { status: "untested", steps: "" }, formatExample: TC_FORMAT_EXAMPLE, aiPrompt: TC_AI_PROMPT, onImport: handleImport, onClose: () => setShowImport(false) }))] }));
}
