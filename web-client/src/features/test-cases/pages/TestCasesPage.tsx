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
import {
  projectRoutes,
  STARTER_LIMITS,
  BTN_SM_SECONDARY,
  BTN_SM_PRIMARY,
} from "@/constants";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@/components/ui/Icons";
import { generateCSV, downloadCSV } from "@/lib/utils/csv";
import type { TestCaseStatus } from "@/types";

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

const VALID_STATUSES = new Set<string>([
  "untested",
  "passed",
  "failed",
  "blocked",
  "skipped",
]);

export default function TestCasesPage() {
  const { projectId, scenarioId } = useParams<{
    projectId: string;
    scenarioId: string;
  }>();
  const navigate = useNavigate();
  const {
    testCases,
    loading,
    createTestCase,
    bulkCreateTestCases,
    updateTestCase,
    deleteTestCase,
    moveTestCase,
  } = useTestCases(projectId, scenarioId);
  const { scenarios } = useScenarios(projectId);
  const { user } = useAuth();
  const { testCasesThisMonth } = useBillingUsage();
  const addInputRef = useRef<HTMLInputElement>(null);
  const [showImport, setShowImport] = useState(false);

  const isStarterLimitReached =
    user?.entitlement !== "pro" &&
    testCasesThisMonth >= STARTER_LIMITS.maxTestCasesPerMonth;

  const scenarioTitle =
    scenarios.find((s) => s.id === scenarioId)?.title ?? "Test Cases";

  async function handleAddBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value.trim();
    if (!val) return;
    if (isStarterLimitReached) return;
    await createTestCase(val);
    e.target.value = "";
  }

  async function handleAddKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const val = (e.target as HTMLInputElement).value.trim();
    if (!val) return;
    if (isStarterLimitReached) return;
    await createTestCase(val);
    (e.target as HTMLInputElement).value = "";
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

  async function handleImport(parsed: Record<string, string>[]) {
    if (isStarterLimitReached) return;
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
        : "untested") as TestCaseStatus,
    }));
    await bulkCreateTestCases(items);
  }

  const passed = testCases.filter((t) => t.status === "passed").length;
  const failed = testCases.filter((t) => t.status === "failed").length;
  const total = testCases.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={scenarioTitle}
        subtitle={
          total > 0
            ? `${passed} passed · ${failed} failed · ${total} total`
            : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(projectRoutes.scenarios(projectId!))}
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              ← Scenarios
            </button>
            {total > 0 && (
              <button onClick={handleExport} className={BTN_SM_SECONDARY}>
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                Export CSV
              </button>
            )}
            <button
              onClick={() => setShowImport(true)}
              className={BTN_SM_PRIMARY}
            >
              <ArrowUpTrayIcon className="w-3.5 h-3.5" />
              Import CSV
            </button>
          </div>
        }
      />

      {/* Progress bar */}
      {total > 0 && (
        <div className="space-y-1">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${Math.round((passed / total) * 100)}%` }}
            />
            <div
              className="h-full bg-red-400 transition-all"
              style={{ width: `${Math.round((failed / total) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-right">
            {Math.round((passed / total) * 100)}% passed
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wide">
          <span className="w-10 shrink-0"></span>
          <span className="flex-1">Test Case Title</span>
          <span className="pr-1">Status</span>
        </div>

        {loading ? (
          <LoadingState className="py-8" />
        ) : testCases.length === 0 ? (
          <EmptyState
            title="No test cases yet"
            description="Add your first test case below, or import from CSV."
            paddingY="py-10"
          />
        ) : (
          testCases.map((tc, i) => (
            <TestCaseRow
              key={tc.id}
              testCase={tc}
              index={i + 1}
              isFirst={i === 0}
              isLast={i === testCases.length - 1}
              onUpdate={updateTestCase}
              onDelete={deleteTestCase}
              onMoveUp={() => moveTestCase(tc.id, "up")}
              onMoveDown={() => moveTestCase(tc.id, "down")}
              onEnterKey={focusAddInput}
            />
          ))
        )}

        {/* Add row */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-dashed border-gray-200">
          <span className="w-10 shrink-0" />
          {isStarterLimitReached ? (
            <p className="flex-1 text-xs text-amber-600">
              Limit reached ({STARTER_LIMITS.maxTestCasesPerMonth} test cases).{" "}
              <a href="/billing" className="underline font-semibold">
                Upgrade to Pro
              </a>{" "}
              for unlimited test cases.
            </p>
          ) : (
            <input
              ref={addInputRef}
              type="text"
              placeholder="Add new test case (press Enter)..."
              onBlur={handleAddBlur}
              onKeyDown={handleAddKeyDown}
              className="flex-1 text-sm text-gray-500 placeholder-gray-300 bg-transparent focus:outline-none"
            />
          )}
        </div>
      </div>

      {showImport && (
        <CsvImportModal
          title="Import Test Cases dari CSV"
          headers={TC_CSV_HEADERS}
          defaultValues={{ status: "untested", steps: "" }}
          formatExample={TC_FORMAT_EXAMPLE}
          aiPrompt={TC_AI_PROMPT}
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
