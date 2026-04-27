import { useState } from "react";
import type { TestRun } from "@/types";
import { cn } from "@/lib/utils/cn";
import { TEST_STATUS_COLOR } from "@/constants";
import { formatDate } from "@/lib/utils/formatDate";

interface Props {
  run: TestRun;
  onDelete: () => void;
}

export default function RunHistoryCard({ run, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const passRate =
    run.summary.total > 0
      ? Math.round((run.summary.passed / run.summary.total) * 100)
      : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {run.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(run.completedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                passRate >= 80
                  ? "bg-green-100 text-green-700"
                  : passRate >= 50
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700",
              )}
            >
              {passRate}% pass
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
            >
              {expanded ? "Close ▲" : "Detail ▼"}
            </button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {run.summary.passed > 0 && (
            <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
              ✓ {run.summary.passed} pass
            </span>
          )}
          {run.summary.failed > 0 && (
            <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
              ✗ {run.summary.failed} fail
            </span>
          )}
          {run.summary.blocked > 0 && (
            <span className="text-[11px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
              ⊘ {run.summary.blocked} blocked
            </span>
          )}
          {run.summary.skipped > 0 && (
            <span className="text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
              — {run.summary.skipped} skip
            </span>
          )}
          <span className="text-[11px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full ml-auto">
            {run.summary.total} test case
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100">
          <div className="divide-y divide-gray-50">
            {Object.entries(run.results).map(([tcId, result]) => (
              <div key={tcId} className="px-4 py-2.5 flex items-start gap-3">
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

          {/* Delete action */}
          <div className="px-4 pb-3 pt-2 flex justify-end">
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
                className="text-xs text-red-400 hover:text-red-600"
              >
                Delete this run
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
