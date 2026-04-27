import { cn } from "@/lib/utils/cn";
import {
  SEVERITY_COLOR,
  BUG_STATUS_LABEL,
  BUG_STATUS_COLOR,
} from "@/constants";
import { formatDate } from "@/lib/utils/formatDate";
import Modal from "@/components/common/Modal";
import type { Bug } from "@/types";

interface Props {
  bug: Bug;
  reportedByName: string;
  onClose: () => void;
}

export default function BugDetailModal({
  bug,
  reportedByName,
  onClose,
}: Props) {
  const statusDot = BUG_STATUS_COLOR[bug.status];

  return (
    <Modal
      title={bug.title}
      subtitle="Bug Detail"
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Status & Severity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", statusDot)} />
            <span className="text-xs font-medium text-gray-600">
              {BUG_STATUS_LABEL[bug.status]}
            </span>
          </div>
          <span
            className={cn(
              "text-[11px] rounded-full px-2.5 py-0.5 font-semibold capitalize",
              SEVERITY_COLOR[bug.severity],
            )}
          >
            {bug.severity}
          </span>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Description
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {bug.description || (
              <span className="italic text-gray-400">
                No description provided.
              </span>
            )}
          </p>
        </div>

        {/* Attachments */}
        {bug.attachments && bug.attachments.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Attachments
            </p>
            <ul className="space-y-1">
              {bug.attachments.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
              Reported By
            </p>
            <p className="text-sm text-gray-700">{reportedByName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
              Created At
            </p>
            <p className="text-sm text-gray-700">{formatDate(bug.createdAt)}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
