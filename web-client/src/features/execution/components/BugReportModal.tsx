import { useState } from "react";
import type { BugSeverity } from "@/types";
import type { CreateBugInput } from "@/features/bugs/hooks/useBugs";
import {
  BUG_SEVERITIES,
  INPUT_CLASS,
  TEXTAREA_CLASS,
  BTN_DANGER,
  BTN_SECONDARY,
} from "@/constants";
import Modal from "@/components/common/Modal";

interface Props {
  testCase: { id: string; title: string };
  onSubmit: (input: CreateBugInput) => Promise<void>;
  onClose: () => void;
}

export default function BugReportModal({ testCase, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(`Bug: ${testCase.title}`);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<BugSeverity>("major");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, severity, testCaseId: testCase.id });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Bug Report"
      subtitle={`From test case: ${testCase.title}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Bug Title
          </label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={TEXTAREA_CLASS}
            placeholder="Steps to reproduce, actual vs expected result..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Severity
          </label>
          <div className="flex gap-2">
            {BUG_SEVERITIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`flex-1 py-1.5 text-xs rounded-lg border font-semibold capitalize transition-colors ${
                  severity === s
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            Skip
          </button>
          <button type="submit" disabled={loading} className={BTN_DANGER}>
            {loading ? "Saving..." : "Report Bug"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
