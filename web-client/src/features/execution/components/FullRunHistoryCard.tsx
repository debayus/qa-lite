import { useState } from "react";
import type { FullTestRun } from "@/types";
import { cn } from "@/lib/utils/cn";
import { TEST_STATUS_COLOR } from "@/constants";
import { formatDate } from "@/lib/utils/formatDate";

interface Props {
  run: FullTestRun;
  onDelete: () => void;
}

export default function FullRunHistoryCard({ run, onDelete }: Props) {
  const [expandedScenarios, setExpandedScenarios] = useState<
    Record<string, boolean>
  >({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const s = run.overallSummary;
  const passRate = s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0;

  const scenarioEntries = (run.scenarioOrder ?? Object.keys(run.scenarioRuns))
    .filter((id) => id in run.scenarioRuns)
    .map(
      (id) =>
        [id, run.scenarioRuns[id]] as [
          string,
          (typeof run.scenarioRuns)[string],
        ],
    );

  function toggleScenario(scId: string) {
    setExpandedScenarios((prev) => ({ ...prev, [scId]: !prev[scId] }));
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {run.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(run.completedAt)}
              {" · "}
              <span className="text-gray-500">
                {scenarioEntries.length} scenario
              </span>
            </p>
          </div>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0",
              passRate >= 80
                ? "bg-green-100 text-green-700"
                : passRate >= 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700",
            )}
          >
            {passRate}% pass
          </span>
        </div>

        {/* Overall summary chips */}
        <div className="flex flex-wrap gap-1.5">
          {s.passed > 0 && (
            <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
              ✓ {s.passed} pass
            </span>
          )}
          {s.failed > 0 && (
            <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
              ✗ {s.failed} fail
            </span>
          )}
          {s.blocked > 0 && (
            <span className="text-[11px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
              ⊘ {s.blocked} blocked
            </span>
          )}
          {s.skipped > 0 && (
            <span className="text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
              — {s.skipped} skip
            </span>
          )}
          <span className="text-[11px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full ml-auto">
            {s.total} test case
          </span>
        </div>
      </div>

      {/* Scenario list — always visible, collapsible per scenario */}
      <div className="border-t border-gray-100 divide-y divide-gray-50">
        {scenarioEntries.map(([scId, scData]) => {
          const scPassRate =
            scData.summary.total > 0
              ? Math.round((scData.summary.passed / scData.summary.total) * 100)
              : 0;
          const isOpen = expandedScenarios[scId] ?? false;

          return (
            <div key={scId}>
              {/* Scenario row */}
              <button
                onClick={() => toggleScenario(scId)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {scData.scenarioTitle}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {scData.summary.passed > 0 && (
                      <span className="text-[10px] text-green-600">
                        ✓ {scData.summary.passed}
                      </span>
                    )}
                    {scData.summary.failed > 0 && (
                      <span className="text-[10px] text-red-600">
                        ✗ {scData.summary.failed}
                      </span>
                    )}
                    {scData.summary.blocked > 0 && (
                      <span className="text-[10px] text-orange-500">
                        ⊘ {scData.summary.blocked}
                      </span>
                    )}
                    {scData.summary.skipped > 0 && (
                      <span className="text-[10px] text-gray-400">
                        — {scData.summary.skipped}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded-full",
                      scPassRate >= 80
                        ? "bg-green-100 text-green-700"
                        : scPassRate >= 50
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700",
                    )}
                  >
                    {scPassRate}%
                  </span>
                  <span className="text-gray-400 text-xs">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {/* Test case detail */}
              {isOpen && (
                <div className="bg-gray-50 divide-y divide-gray-100">
                  {Object.entries(scData.results).map(([tcId, result]) => (
                    <div
                      key={tcId}
                      className="px-4 py-2.5 flex items-start gap-3"
                    >
                      <span
                        className={cn(
                          "text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 capitalize",
                          TEST_STATUS_COLOR[result.status] ??
                            "bg-gray-100 text-gray-600",
                        )}
                      >
                        {result.status}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-700">{result.title}</p>
                        {result.note && (
                          <p className="text-[11px] text-gray-400 mt-0.5 italic">
                            {result.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete action */}
      <div className="px-4 pb-3 pt-2 flex justify-end border-t border-gray-100">
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Delete this run?</span>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
