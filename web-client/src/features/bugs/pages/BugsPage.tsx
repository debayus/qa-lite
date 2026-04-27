import { useState } from "react";
import { useParams } from "react-router-dom";
import { useBugs } from "../hooks/useBugs";
import BugCard from "../components/BugCard";
import CreateBugModal from "../components/CreateBugModal";
import BugDetailModal from "../components/BugDetailModal";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import { BUG_STATUS_LABEL, BUG_STATUS_COLOR, BTN_DANGER } from "@/constants";
import Badge from "@/components/ui/Badge";
import type { Bug, BugStatus } from "@/types";

const COLUMNS: BugStatus[] = ["open", "in_progress", "resolved", "closed"];

export default function BugsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { bugs, loading, createBug, updateBugStatus, deleteBug, userMap } =
    useBugs(projectId);
  const [showModal, setShowModal] = useState(false);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bug Tracker"
        action={
          <button onClick={() => setShowModal(true)} className={BTN_DANGER}>
            <span className="text-base leading-none">+</span>
            Report Bug
          </button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : (
        <div className="-mx-4 px-4 overflow-x-auto md:mx-0 md:px-0">
          <div className="grid grid-cols-4 gap-4 min-w-[640px]">
            {COLUMNS.map((status) => {
              const colBugs = bugs.filter((b) => b.status === status);
              const label = BUG_STATUS_LABEL[status];
              const color = BUG_STATUS_COLOR[status];
              return (
                <div key={status} className="min-w-[180px] flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-sm font-semibold text-gray-700">
                      {label}
                    </span>
                    <Badge className="ml-auto bg-gray-100 text-gray-500">
                      {colBugs.length}
                    </Badge>
                  </div>

                  <div className="space-y-2 min-h-[120px]">
                    {colBugs.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-100 rounded-xl h-20 flex items-center justify-center">
                        <span className="text-xs text-gray-300">Empty</span>
                      </div>
                    ) : (
                      colBugs.map((bug) => (
                        <BugCard
                          key={bug.id}
                          bug={bug}
                          reportedByName={
                            userMap[bug.reportedBy] ?? bug.reportedBy
                          }
                          onStatusChange={updateBugStatus}
                          onDelete={deleteBug}
                          onClick={() => setSelectedBug(bug)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <CreateBugModal
          onClose={() => setShowModal(false)}
          onSubmit={createBug}
        />
      )}

      {selectedBug && (
        <BugDetailModal
          bug={selectedBug}
          reportedByName={
            userMap[selectedBug.reportedBy] ?? selectedBug.reportedBy
          }
          onClose={() => setSelectedBug(null)}
        />
      )}
    </div>
  );
}
