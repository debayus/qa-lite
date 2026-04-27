import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { signUpWithEmail } from "@/lib/firebase/auth";
import { INPUT_CLASS, BTN_SUBMIT } from "@/constants";

interface Props {
  onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signUpWithEmail(email, password);
      await updateProfile(cred.user, { displayName });
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={INPUT_CLASS}
          placeholder="Full Name"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLASS}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT_CLASS}
          placeholder="At least 6 characters"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={BTN_SUBMIT}
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
