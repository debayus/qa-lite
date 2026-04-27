import { useState } from "react";
import type { UserRole } from "@/types";
import { INPUT_CLASS, BTN_PRIMARY, BTN_SECONDARY } from "@/constants";
import Modal from "@/components/common/Modal";

const ROLES: UserRole[] = ["admin", "tester", "viewer"];

interface Props {
  projectId: string;
  onClose: () => void;
  onInvite: (projectId: string, email: string, role: UserRole) => Promise<void>;
}

export default function InviteModal({ projectId, onClose, onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("tester");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onInvite(projectId, email.trim(), role);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add member.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Invite Member" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            autoFocus
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={INPUT_CLASS}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading ? "Sending..." : "Invite"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
