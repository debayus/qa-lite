import { useState } from "react";
import type { BugSeverity } from "@/types";
import type { CreateBugInput } from "../hooks/useBugs";
import {
  BUG_SEVERITIES,
  INPUT_CLASS,
  TEXTAREA_CLASS,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from "@/constants";
import Modal from "@/components/common/Modal";

interface Props {
  onClose: () => void;
  onSubmit: (input: CreateBugInput) => Promise<void>;
}

export default function CreateBugModal({ onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<BugSeverity>("major");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, severity });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Report Bug" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_CLASS}
            placeholder="Bug summary"
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className={BTN_PRIMARY}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
