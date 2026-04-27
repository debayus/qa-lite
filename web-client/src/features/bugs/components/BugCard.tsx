import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { SEVERITY_COLOR, BUG_NEXT_STATUS, BUG_STATUS_LABEL } from "@/constants";
import { TrashIcon } from "@/components/ui/Icons";
import ConfirmModal from "@/components/common/ConfirmModal";
import type { Bug, BugStatus } from "@/types";

interface Props {
  bug: Bug;
  reportedByName: string;
  onStatusChange: (bugId: string, status: BugStatus) => Promise<void>;
  onDelete: (bugId: string) => Promise<void>;
  onClick?: () => void;
}

export default function BugCard({
  bug,
  reportedByName,
  onStatusChange,
  onDelete,
  onClick,
}: Props) {
  const next = BUG_NEXT_STATUS[bug.status];
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 leading-snug flex-1">
          {bug.title}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
          className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
          title="Hapus bug"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-[11px] rounded-full px-2.5 py-0.5 font-semibold capitalize",
            SEVERITY_COLOR[bug.severity],
          )}
        >
          {bug.severity}
        </span>
        <span className="text-[11px] text-gray-400">
          {BUG_STATUS_LABEL[bug.status]}
        </span>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-3 h-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
        <span>{reportedByName}</span>
      </div>

      {next && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(bug.id, next);
          }}
          className="w-full text-xs text-center py-1.5 rounded-lg border border-dashed border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors font-medium"
        >
          Tandai: {BUG_STATUS_LABEL[next]}
        </button>
      )}

      {confirmOpen && (
        <ConfirmModal
          title="Delete this bug?"
          description={`"${bug.title}" will be permanently deleted.`}
          onConfirm={() => {
            setConfirmOpen(false);
            onDelete(bug.id);
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
