import { useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useBugs } from "@/features/bugs/hooks/useBugs";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { generateCSV, downloadCSV } from "@/lib/utils/csv";
import type { BugSeverity, BugStatus } from "@/types";
import PageHeader from "@/components/common/PageHeader";
import { BUG_STATUS_LABEL } from "@/constants";
import {
  ChartBarIcon,
  BugAntIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
} from "@/components/ui/Icons";

const BUG_STATUS_ORDER: BugStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];
const SEVERITY_ORDER: BugSeverity[] = ["critical", "major", "minor", "trivial"];

const STATUS_BAR_COLOR: Record<BugStatus, string> = {
  open: "bg-red-400",
  in_progress: "bg-yellow-400",
  resolved: "bg-blue-400",
  closed: "bg-gray-300",
};

const STATUS_BADGE_COLOR: Record<BugStatus, string> = {
  open: "bg-red-50 text-red-600",
  in_progress: "bg-yellow-50 text-yellow-700",
  resolved: "bg-blue-50 text-blue-600",
  closed: "bg-gray-100 text-gray-500",
};

export default function ReportsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useProject(projectId);
  const { bugs } = useBugs(projectId);
  const { user } = useAuth();
  const isPro = user?.entitlement === "pro";

  const totalTC = project?.stats.totalTestCases ?? 0;
  const passed = project?.stats.passedTestCases ?? 0;
  const passRate = totalTC > 0 ? Math.round((passed / totalTC) * 100) : 0;
  const openBugs = bugs.filter((b) => b.status === "open").length;
  const resolvedBugs = bugs.filter(
    (b) => b.status === "resolved" || b.status === "closed",
  ).length;

  const healthLabel =
    passRate >= 90
      ? "Excellent"
      : passRate >= 75
        ? "Good"
        : passRate >= 50
          ? "Needs Attention"
          : "Critical";

  const healthGradient =
    passRate >= 90
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Reports & Analytics"
        action={
          isPro ? (
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                Export PDF
              </button>
            </div>
          ) : (
            <a
              href="/billing"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              Export (Pro)
            </a>
          )
        }
      />

      {/* Hero health card */}
      <div
        className={cn(
          "bg-gradient-to-r rounded-2xl p-5 text-white shadow-md",
          healthGradient,
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium mb-1">
              Project Health
            </p>
            <p className="text-3xl font-bold">{passRate}%</p>
            <p className="text-white/80 text-sm mt-0.5">{healthLabel}</p>
          </div>
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/80 rounded-full transition-all"
            style={{ width: `${passRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/70 mt-1.5">
          <span>{passed} passed</span>
          <span>{totalTC} total test cases</span>
        </div>
      </div>

      {/* Stat summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-800">{totalTC}</p>
          <p className="text-xs text-gray-500 mt-1">Test Cases</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-500">{openBugs}</p>
          <p className="text-xs text-gray-500 mt-1">Open Bugs</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-500">{resolvedBugs}</p>
          <p className="text-xs text-gray-500 mt-1">Resolved</p>
        </div>
      </div>

      {/* Bug Status Distribution */}
      <section className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BugAntIcon className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">
            Bug Status Distribution
          </h2>
        </div>
        <div className="space-y-3">
          {BUG_STATUS_ORDER.map((status) => {
            const count = bugs.filter((b) => b.status === status).length;
            const pct =
              bugs.length > 0 ? Math.round((count / bugs.length) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-24 text-xs text-gray-600 shrink-0">
                  {BUG_STATUS_LABEL[status]}
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      STATUS_BAR_COLOR[status],
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "shrink-0 min-w-[28px] text-center text-xs font-semibold px-2 py-0.5 rounded-full",
                    STATUS_BADGE_COLOR[status],
                  )}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
        {bugs.length === 0 && (
          <p className="text-center text-xs text-gray-300 py-4">
            No bugs reported yet.
          </p>
        )}
      </section>

      {/* Severity Distribution */}
      <section className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircleIcon className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">
            Bug Severity Breakdown
          </h2>
        </div>
        <div className="space-y-3">
          {SEVERITY_ORDER.map((sev) => {
            const count = bugs.filter((b) => b.severity === sev).length;
            const pct =
              bugs.length > 0 ? Math.round((count / bugs.length) * 100) : 0;
            const barColor =
              sev === "critical"
                ? "bg-red-500"
                : sev === "major"
                  ? "bg-orange-400"
                  : sev === "minor"
                    ? "bg-yellow-400"
                    : "bg-gray-300";
            const badgeColor =
              sev === "critical"
                ? "bg-red-50 text-red-600"
                : sev === "major"
                  ? "bg-orange-50 text-orange-600"
                  : sev === "minor"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-gray-100 text-gray-500";
            return (
              <div key={sev} className="flex items-center gap-3">
                <span className="w-16 text-xs text-gray-600 capitalize shrink-0">
                  {sev}
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      barColor,
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "shrink-0 min-w-[28px] text-center text-xs font-semibold px-2 py-0.5 rounded-full",
                    badgeColor,
                  )}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
        {bugs.length === 0 && (
          <p className="text-center text-xs text-gray-300 py-4">
            No bugs reported yet.
          </p>
        )}
      </section>
    </div>
  );
}
