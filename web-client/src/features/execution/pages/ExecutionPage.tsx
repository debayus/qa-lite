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
import type { TestCaseStatus, TestRunResult } from "@/types";
import { TEST_STATUS_COLOR, INPUT_CLASS, BTN_PRIMARY } from "@/constants";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils/formatDate";

// ─── Static helpers ──────────────────────────────────────────────────────────

const STATUS_BUTTONS: {
  label: string;
  status: TestCaseStatus;
  color: string;
}[] = [
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

// ─── TestCaseItem sub-component ──────────────────────────────────────────────

interface TestCaseItemProps {
  tcId: string;
  result: TestRunResult;
  onStatus: (tcId: string, status: TestCaseStatus) => void;
  onNoteBlur: (tcId: string, note: string) => void;
}

function TestCaseItem({
  tcId,
  result,
  onStatus,
  onNoteBlur,
}: TestCaseItemProps) {
  const [note, setNote] = useState(result.note ?? "");

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900">{result.title}</p>
        {result.status !== "untested" && (
          <span
            className={cn(
              "text-[11px] font-semibold rounded-full px-2.5 py-0.5 shrink-0 capitalize",
              TEST_STATUS_COLOR[result.status] ?? "bg-gray-100 text-gray-600",
            )}
          >
            {result.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {STATUS_BUTTONS.map(({ label, status, color }) => (
          <button
            key={status}
            onClick={() => onStatus(tcId, status)}
            className={cn(
              "py-2 text-xs font-semibold rounded-lg transition-all",
              result.status === status
                ? color + " ring-2 ring-offset-1 ring-gray-300 scale-95"
                : color + " opacity-70 hover:opacity-100",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {result.status !== "untested" && (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => onNoteBlur(tcId, note)}
          placeholder="Note (optional)..."
          className="w-full text-xs rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50"
        />
      )}
    </div>
  );
}

// ─── RunSummaryBar sub-component ─────────────────────────────────────────────

interface RunSummaryBarProps {
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  untested: number;
  total: number;
}

function RunSummaryBar({
  passed,
  failed,
  blocked,
  skipped,
  untested,
  total,
}: RunSummaryBarProps) {
  const done = total - untested;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {done} / {total} done
        </span>
        <span className="font-medium text-indigo-600">Pass {passRate}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex gap-3 text-[11px] text-gray-400 pt-0.5">
        <span className="text-green-600">✓ {passed} pass</span>
        <span className="text-red-600">✗ {failed} fail</span>
        <span className="text-orange-500">⊘ {blocked} blocked</span>
        <span>— {skipped} skip</span>
        {untested > 0 && (
          <span className="ml-auto text-gray-300">{untested} untested</span>
        )}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

type RunMode = "all" | "scenario";
type Tab = "active" | "history";
type TcFilter =
  | "untested"
  | "tested"
  | "passed"
  | "failed"
  | "blocked"
  | "skipped"
  | "all";

const FILTER_CHIPS: {
  label: string;
  value: TcFilter;
  activeClass: string;
}[] = [
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

function matchesFilter(status: TestCaseStatus, filter: TcFilter): boolean {
  if (filter === "all") return true;
  if (filter === "tested") return status !== "untested";
  return status === (filter as TestCaseStatus);
}

export default function ExecutionPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { scenarios } = useScenarios(projectId);

  // ── Run mode ──────────────────────────────────────────────────────────────
  const [runMode, setRunMode] = useState<RunMode>("all");

  // ── Single-scenario state ─────────────────────────────────────────────────
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const { testCases } = useTestCases(
    projectId,
    selectedScenarioId || undefined,
  );
  const {
    activeRun,
    completedRuns,
    createRun,
    updateResult: updateSingleResult,
    completeRun,
    deleteRun,
  } = useTestRuns(projectId, selectedScenarioId || undefined);

  // ── Full-run state ────────────────────────────────────────────────────────
  const {
    activeFullRun,
    completedFullRuns,
    createFullRun,
    updateResult: updateFullResult,
    completeFullRun,
    deleteFullRun,
  } = useFullRuns(projectId);

  const { createBug } = useBugs(projectId);

  const [tab, setTab] = useState<Tab>("active");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bugModalFor, setBugModalFor] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [completing, setCompleting] = useState(false);
  const [expandedScenarios, setExpandedScenarios] = useState<
    Record<string, boolean>
  >({});
  const [tcFilter, setTcFilter] = useState<TcFilter>("untested");

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);
  const nextRunNumber = completedRuns.length + (activeRun ? 1 : 0) + 1;
  const nextFullRunNumber =
    completedFullRuns.length + (activeFullRun ? 1 : 0) + 1;

  function toggleScenarioSection(scId: string) {
    setExpandedScenarios((prev) => ({ ...prev, [scId]: !prev[scId] }));
  }

  // ── Single-scenario handlers ───────────────────────────────────────────────
  async function handleSingleStatus(tcId: string, status: TestCaseStatus) {
    if (!activeRun) return;
    await updateSingleResult(activeRun.id, tcId, status);
    if (status === "failed") {
      const result = activeRun.results[tcId];
      setBugModalFor({ id: tcId, title: result?.title ?? "" });
    }
  }

  async function handleSingleNoteBlur(tcId: string, note: string) {
    if (!activeRun) return;
    await updateSingleResult(
      activeRun.id,
      tcId,
      activeRun.results[tcId].status,
      note,
    );
  }

  async function handleCompleteRun() {
    if (!activeRun) return;
    setCompleting(true);
    try {
      await completeRun(activeRun.id);
      setTab("history");
    } finally {
      setCompleting(false);
    }
  }

  async function handleCreateSingleRun(name: string) {
    if (!selectedScenarioId || !selectedScenario) return;
    await createRun(
      selectedScenarioId,
      selectedScenario.title,
      testCases,
      name,
    );
    setShowCreateModal(false);
  }

  // ── Full-run handlers ─────────────────────────────────────────────────────
  async function handleFullStatus(
    scenarioId: string,
    tcId: string,
    status: TestCaseStatus,
  ) {
    if (!activeFullRun) return;
    await updateFullResult(activeFullRun.id, scenarioId, tcId, status);
    if (status === "failed") {
      const result = activeFullRun.scenarioRuns[scenarioId]?.results[tcId];
      setBugModalFor({ id: tcId, title: result?.title ?? "" });
    }
  }

  async function handleFullNoteBlur(
    scenarioId: string,
    tcId: string,
    note: string,
  ) {
    if (!activeFullRun) return;
    const currentStatus =
      activeFullRun.scenarioRuns[scenarioId]?.results[tcId]?.status ??
      "untested";
    await updateFullResult(
      activeFullRun.id,
      scenarioId,
      tcId,
      currentStatus,
      note,
    );
  }

  async function handleCompleteFullRun() {
    if (!activeFullRun) return;
    setCompleting(true);
    try {
      await completeFullRun(activeFullRun.id);
      setTab("history");
    } finally {
      setCompleting(false);
    }
  }

  async function handleCreateFullRun(name: string) {
    await createFullRun(name, scenarios);
    setShowCreateModal(false);
    // Expand all scenarios by default
    const expanded: Record<string, boolean> = {};
    scenarios.forEach((s) => (expanded[s.id] = true));
    setExpandedScenarios(expanded);
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const fullOverall = activeFullRun?.overallSummary;
  const filterBar = (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {FILTER_CHIPS.map(({ label, value, activeClass }) => (
        <button
          key={value}
          onClick={() => setTcFilter(value)}
          className={cn(
            "shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
            tcFilter === value
              ? activeClass
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
  const activeResults = activeRun ? Object.entries(activeRun.results) : [];
  const total = activeResults.length;
  const passed = activeResults.filter(([, r]) => r.status === "passed").length;
  const failed = activeResults.filter(([, r]) => r.status === "failed").length;
  const blocked = activeResults.filter(
    ([, r]) => r.status === "blocked",
  ).length;
  const skipped = activeResults.filter(
    ([, r]) => r.status === "skipped",
  ).length;
  const untested = activeResults.filter(
    ([, r]) => r.status === "untested",
  ).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Test Execution"
        subtitle="Run and record test execution results"
      />

      {/* ── Run Mode switcher ─────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => {
            setRunMode("all");
            setTab("active");
          }}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors",
            runMode === "all"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          Run All Scenarios
          {activeFullRun && (
            <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-indigo-500 align-middle" />
          )}
        </button>
        <button
          onClick={() => {
            setRunMode("scenario");
            setTab("active");
          }}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors",
            runMode === "scenario"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          By Scenario
          {activeRun && (
            <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-indigo-500 align-middle" />
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RUN ALL SCENARIOS MODE
         ══════════════════════════════════════════════════════════════════════ */}
      {runMode === "all" && (
        <>
          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setTab("active")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                tab === "active"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              Active Run
              {activeFullRun && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-indigo-500 align-middle" />
              )}
            </button>
            <button
              onClick={() => setTab("history")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                tab === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              History
              {completedFullRuns.length > 0 && (
                <span className="ml-1.5 text-xs text-gray-400">
                  ({completedFullRuns.length})
                </span>
              )}
            </button>
          </div>

          {/* ── All-scenarios Active Run tab ─────────────────────────────── */}
          {tab === "active" && (
            <div className="space-y-4">
              {!activeFullRun ? (
                <EmptyState
                  paddingY="py-12"
                  title="No active run"
                  description={
                    scenarios.length === 0
                      ? "Add scenarios and test cases first before running."
                      : "Create a full run to execute all scenarios at once."
                  }
                  action={
                    scenarios.length > 0 ? (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className={BTN_PRIMARY}
                      >
                        + Create Full Run
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  {/* Run info + overall progress */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {activeFullRun.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Started {formatDate(activeFullRun.createdAt)}
                          {" · "}
                          {Object.keys(activeFullRun.scenarioRuns).length}{" "}
                          scenario
                        </p>
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2.5 py-1 rounded-full">
                        In Progress
                      </span>
                    </div>

                    {fullOverall && fullOverall.total > 0 && (
                      <RunSummaryBar
                        passed={fullOverall.passed}
                        failed={fullOverall.failed}
                        blocked={fullOverall.blocked}
                        skipped={fullOverall.skipped}
                        untested={fullOverall.untested}
                        total={fullOverall.total}
                      />
                    )}
                  </div>

                  {/* Filter bar */}
                  {filterBar}

                  {/* Per-scenario sections */}
                  <div className="space-y-3">
                    {(
                      activeFullRun.scenarioOrder ??
                      Object.keys(activeFullRun.scenarioRuns)
                    )
                      .filter((scId) => scId in activeFullRun.scenarioRuns)
                      .map((scId) => {
                        const scData = activeFullRun.scenarioRuns[scId];
                        const isOpen = expandedScenarios[scId] ?? true;
                        const scSummary = scData.summary;
                        const scDone = scSummary.total - scSummary.untested;
                        const filteredResults = Object.entries(
                          scData.results,
                        ).filter(([, r]) => matchesFilter(r.status, tcFilter));
                        if (filteredResults.length === 0) return null;

                        return (
                          <div
                            key={scId}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                          >
                            {/* Scenario header */}
                            <button
                              onClick={() => toggleScenarioSection(scId)}
                              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {scData.scenarioTitle}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {scDone} / {scSummary.total} done
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {scSummary.untested === 0 && (
                                  <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    Done
                                  </span>
                                )}
                                <span className="text-gray-400 text-xs">
                                  {isOpen ? "▲" : "▼"}
                                </span>
                              </div>
                            </button>

                            {/* Test cases */}
                            {isOpen && (
                              <div className="border-t border-gray-100 p-3 space-y-2">
                                {filteredResults.map(([tcId, result]) => (
                                  <TestCaseItem
                                    key={tcId}
                                    tcId={tcId}
                                    result={result}
                                    onStatus={(id, status) =>
                                      handleFullStatus(scId, id, status)
                                    }
                                    onNoteBlur={(id, note) =>
                                      handleFullNoteBlur(scId, id, note)
                                    }
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Complete button */}
                  <button
                    onClick={handleCompleteFullRun}
                    disabled={completing}
                    className="w-full py-3 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {completing ? "Saving..." : "Complete Full Run"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── All-scenarios History tab ─────────────────────────────────── */}
          {tab === "history" && (
            <div className="space-y-3">
              {completedFullRuns.length === 0 ? (
                <EmptyState
                  paddingY="py-12"
                  title="No run history yet"
                  description="History will appear after you complete the first full run."
                />
              ) : (
                completedFullRuns.map((run) => (
                  <FullRunHistoryCard
                    key={run.id}
                    run={run}
                    onDelete={() => deleteFullRun(run.id)}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BY SCENARIO MODE
         ══════════════════════════════════════════════════════════════════════ */}
      {runMode === "scenario" && (
        <>
          {/* Scenario selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Select Scenario
            </label>
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                setTab("active");
              }}
              className={INPUT_CLASS}
            >
              <option value="">-- Select a scenario --</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {selectedScenarioId && (
            <>
              {/* Tab switcher */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setTab("active")}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                    tab === "active"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  Active Run
                  {activeRun && (
                    <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-indigo-500 align-middle" />
                  )}
                </button>
                <button
                  onClick={() => setTab("history")}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                    tab === "history"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  History
                  {completedRuns.length > 0 && (
                    <span className="ml-1.5 text-xs text-gray-400">
                      ({completedRuns.length})
                    </span>
                  )}
                </button>
              </div>

              {/* ── Single-scenario Active Run tab ───────────────────────── */}
              {tab === "active" && (
                <div className="space-y-4">
                  {!activeRun ? (
                    <EmptyState
                      paddingY="py-12"
                      title="No active run"
                      description="Create a new run to start executing test cases for this scenario."
                      action={
                        <button
                          onClick={() => setShowCreateModal(true)}
                          disabled={testCases.length === 0}
                          className={BTN_PRIMARY}
                        >
                          + Create New Run
                        </button>
                      }
                    />
                  ) : (
                    <>
                      {/* Run info card */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {activeRun.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Started {formatDate(activeRun.createdAt)}
                            </p>
                          </div>
                          <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2.5 py-1 rounded-full">
                            In Progress
                          </span>
                        </div>

                        {total > 0 && (
                          <RunSummaryBar
                            passed={passed}
                            failed={failed}
                            blocked={blocked}
                            skipped={skipped}
                            untested={untested}
                            total={total}
                          />
                        )}
                      </div>

                      {/* Filter bar */}
                      {filterBar}

                      {/* Test case list */}
                      <div className="space-y-3">
                        {activeResults
                          .filter(([, r]) => matchesFilter(r.status, tcFilter))
                          .map(([tcId, result]) => (
                            <TestCaseItem
                              key={tcId}
                              tcId={tcId}
                              result={result}
                              onStatus={handleSingleStatus}
                              onNoteBlur={handleSingleNoteBlur}
                            />
                          ))}
                      </div>

                      {/* Complete button */}
                      <button
                        onClick={handleCompleteRun}
                        disabled={completing}
                        className="w-full py-3 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {completing ? "Saving..." : "Complete Run"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ── Single-scenario History tab ───────────────────────────── */}
              {tab === "history" && (
                <div className="space-y-3">
                  {completedRuns.length === 0 ? (
                    <EmptyState
                      paddingY="py-12"
                      title="No run history yet"
                      description="History will appear after you complete the first execution."
                    />
                  ) : (
                    completedRuns.map((run) => (
                      <RunHistoryCard
                        key={run.id}
                        run={run}
                        onDelete={() => deleteRun(run.id)}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showCreateModal && runMode === "all" && (
        <CreateRunModal
          defaultName={`Full Run #${nextFullRunNumber}`}
          onSubmit={handleCreateFullRun}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showCreateModal && runMode === "scenario" && (
        <CreateRunModal
          defaultName={`Run #${nextRunNumber}`}
          onSubmit={handleCreateSingleRun}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {bugModalFor && (
        <BugReportModal
          testCase={bugModalFor}
          onSubmit={createBug}
          onClose={() => setBugModalFor(null)}
        />
      )}
    </div>
  );
}
