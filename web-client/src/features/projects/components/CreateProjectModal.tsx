import { useState } from "react";
import Modal from "@/components/common/Modal";
import { INPUT_CLASS, BTN_PRIMARY, BTN_SECONDARY } from "@/constants";

interface Props {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export default function CreateProjectModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Create New Project" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile App v2.0"
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className={BTN_PRIMARY}
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
