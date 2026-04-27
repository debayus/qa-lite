import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useScenarios } from "../hooks/useScenarios";
import { projectRoutes, INPUT_CLASS, BTN_PRIMARY, BTN_DANGER, BTN_SECONDARY, BTN_SM_SECONDARY, BTN_SM_PRIMARY, } from "@/constants";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ConfirmModal from "@/components/common/ConfirmModal";
import CsvImportModal from "@/components/common/CsvImportModal";
import { ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, } from "@/components/ui/Icons";
import { generateCSV, downloadCSV } from "@/lib/utils/csv";
const SCENARIO_CSV_HEADERS = [
    "scenario_title",
    "tc_title",
    "tc_steps",
    "tc_status",
];
const VALID_TC_STATUSES = new Set([
    "untested",
    "passed",
    "failed",
    "blocked",
    "skipped",
]);
const SCENARIO_FORMAT_EXAMPLE = `scenario_title,tc_title,tc_steps,tc_status
Login Flow,Login dengan kredensial valid,"Buka halaman login|Masukkan email|Masukkan password|Klik Login",untested
Login Flow,Login dengan email kosong,"Buka halaman login|Klik Login tanpa isi email",untested
Register Flow,Register dengan email valid,"Buka halaman register|Isi form|Submit",untested
Password Reset,,, `;
const SCENARIO_AI_PROMPT = `Buat daftar test scenario beserta test case untuk fitur: [deskripsi fitur Anda]

Format output CSV (salin persis termasuk header):
scenario_title,tc_title,tc_steps,tc_status
"Nama Scenario","Judul Test Case","Langkah 1|Langkah 2|Langkah 3",untested

Aturan:
- Satu test case per baris
- Ulangi scenario_title untuk setiap test case dalam scenario yang sama
- Pisahkan langkah dengan | (pipe)
- tc_status: untested / passed / failed / blocked / skipped
- Scenario tanpa test case: isi tc_title, tc_steps, tc_status dengan kosong
- Gunakan tanda kutip ganda jika nilai mengandung koma`;
export default function ScenariosPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { scenarios, loading, createScenario, mergeImportScenariosWithTestCases, fetchAllTestCases, deleteScenario, bulkDeleteScenarios, moveScenario, } = useScenarios(projectId);
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [showImport, setShowImport] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const confirmScenario = scenarios.find((s) => s.id === confirmId);
    function toggleSelect(id) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }
    function toggleSelectAll() {
        if (selectedIds.size === scenarios.length) {
            setSelectedIds(new Set());
        }
        else {
            setSelectedIds(new Set(scenarios.map((s) => s.id)));
        }
    }
    async function handleBulkDelete() {
        await bulkDeleteScenarios(Array.from(selectedIds));
        setSelectedIds(new Set());
        setConfirmBulkDelete(false);
    }
    async function handleCreate(e) {
        e.preventDefault();
        if (!newTitle.trim())
            return;
        setCreating(true);
        await createScenario(newTitle.trim());
        setNewTitle("");
        setCreating(false);
    }
    async function handleExport() {
        const allTcs = await fetchAllTestCases();
        const rows = [];
        scenarios.forEach((s) => {
            const tcs = allTcs
                .filter((tc) => tc.scenarioId === s.id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            if (tcs.length === 0) {
                rows.push([s.title, "", "", ""]);
            }
            else {
                tcs.forEach((tc) => rows.push([s.title, tc.title, tc.steps.join("|"), tc.status]));
            }
        });
        const csv = generateCSV(SCENARIO_CSV_HEADERS, rows);
        downloadCSV("scenarios-with-test-cases.csv", csv);
    }
    async function handleImport(parsed) {
        const scenarioMap = new Map();
        const scenarioOrder = [];
        for (const r of parsed) {
            const scenarioTitle = r["scenario_title"]?.trim();
            if (!scenarioTitle)
                continue;
            if (!scenarioMap.has(scenarioTitle)) {
                scenarioMap.set(scenarioTitle, []);
                scenarioOrder.push(scenarioTitle);
            }
            const tcTitle = r["tc_title"]?.trim();
            if (tcTitle) {
                scenarioMap.get(scenarioTitle).push({
                    title: tcTitle,
                    steps: r["tc_steps"]
                        ? r["tc_steps"]
                            .split("|")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        : [],
                    status: (VALID_TC_STATUSES.has(r["tc_status"])
                        ? r["tc_status"]
                        : "untested"),
                });
            }
        }
        const data = scenarioOrder.map((title) => ({
            title,
            testCases: scenarioMap.get(title),
        }));
        await mergeImportScenariosWithTestCases(data);
    }
    return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsx(PageHeader, { title: "Test Scenarios", subtitle: !loading ? `${scenarios.length} scenario(s)` : undefined, action: _jsxs("div", { className: "flex items-center gap-2", children: [scenarios.length > 0 && (_jsxs("button", { onClick: handleExport, title: "Export CSV", className: BTN_SM_SECONDARY, children: [_jsx(ArrowDownTrayIcon, { className: "w-3.5 h-3.5" }), "Export CSV"] })), _jsxs("button", { onClick: () => setShowImport(true), title: "Import CSV", className: BTN_SM_PRIMARY, children: [_jsx(ArrowUpTrayIcon, { className: "w-3.5 h-3.5" }), "Import CSV"] })] }) }), _jsxs("form", { onSubmit: handleCreate, className: "flex gap-2", children: [_jsx("input", { type: "text", value: newTitle, onChange: (e) => setNewTitle(e.target.value), placeholder: "New scenario name...", className: INPUT_CLASS }), _jsx("button", { type: "submit", disabled: creating || !newTitle.trim(), className: BTN_PRIMARY, children: "+ Add" })] }), loading ? (_jsx(LoadingState, {})) : scenarios.length === 0 ? (_jsx(EmptyState, { title: "No scenarios yet", description: "Add your first scenario above, or import from CSV." })) : (_jsxs("div", { className: "space-y-2", children: [selectedIds.size > 0 && (_jsxs("div", { className: "flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5", children: [_jsx("input", { type: "checkbox", checked: selectedIds.size === scenarios.length, onChange: toggleSelectAll, className: "w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer shrink-0" }), _jsxs("span", { className: "text-sm text-red-700 font-medium flex-1", children: [selectedIds.size, " of ", scenarios.length, " selected"] }), _jsx("button", { onClick: () => setConfirmBulkDelete(true), className: BTN_DANGER, children: "Delete Selected" }), _jsx("button", { onClick: () => setSelectedIds(new Set()), className: BTN_SECONDARY, children: "Cancel" })] })), scenarios.map((s, i) => (_jsxs("div", { className: "group flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-indigo-300 hover:shadow-sm transition-all", children: [_jsx("input", { type: "checkbox", checked: selectedIds.has(s.id), onChange: () => toggleSelect(s.id), onClick: (e) => e.stopPropagation(), className: `w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0 transition-opacity ${selectedIds.has(s.id)
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"}` }), _jsxs("div", { className: "flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: () => moveScenario(s.id, "up"), disabled: i === 0, className: "p-0.5 rounded text-gray-300 hover:text-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors", title: "Move up", children: _jsx(ChevronUpIcon, { className: "w-3 h-3" }) }), _jsx("button", { onClick: () => moveScenario(s.id, "down"), disabled: i === scenarios.length - 1, className: "p-0.5 rounded text-gray-300 hover:text-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors", title: "Move down", children: _jsx(ChevronDownIcon, { className: "w-3 h-3" }) })] }), _jsx("span", { className: "text-xs font-bold text-indigo-500 bg-indigo-50 rounded-lg w-7 h-7 flex items-center justify-center shrink-0", children: i + 1 }), _jsx("span", { className: "flex-1 text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors cursor-pointer", onClick: () => navigate(projectRoutes.scenarios(projectId) + "/" + s.id), children: s.title }), _jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    setConfirmId(s.id);
                                }, className: "text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all px-1", children: "Delete" }), _jsx(ChevronRightIcon, { className: "w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors shrink-0 cursor-pointer", onClick: () => navigate(projectRoutes.scenarios(projectId) + "/" + s.id) })] }, s.id)))] })), confirmId && confirmScenario && (_jsx(ConfirmModal, { title: "Delete this scenario?", description: `"${confirmScenario.title}" will be permanently deleted.`, onConfirm: () => {
                    deleteScenario(confirmId);
                    setConfirmId(null);
                }, onCancel: () => setConfirmId(null) })), confirmBulkDelete && (_jsx(ConfirmModal, { title: `Delete ${selectedIds.size} scenario(s)?`, description: "All selected scenarios will be permanently deleted.", onConfirm: handleBulkDelete, onCancel: () => setConfirmBulkDelete(false) })), showImport && (_jsx(CsvImportModal, { title: "Import Scenarios dari CSV", headers: SCENARIO_CSV_HEADERS, formatExample: SCENARIO_FORMAT_EXAMPLE, aiPrompt: SCENARIO_AI_PROMPT, onImport: handleImport, onClose: () => setShowImport(false) }))] }));
}
