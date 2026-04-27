import { useState } from "react";
import { INPUT_CLASS, BTN_PRIMARY, BTN_SECONDARY } from "@/constants";
import Modal from "@/components/common/Modal";

interface Props {
  defaultName: string;
  onSubmit: (name: string) => Promise<void>;
  onClose: () => void;
  subtitle?: string;
}

export default function CreateRunModal({
  defaultName,
  onSubmit,
  onClose,
  subtitle,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(name.trim() || defaultName);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Create New Run"
      subtitle={
        subtitle ?? "All test cases from this scenario will be included."
      }
      onClose={onClose}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Run Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={defaultName}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading ? "Creating..." : "Create Run"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
