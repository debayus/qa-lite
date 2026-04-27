import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { signUpWithEmail } from "@/lib/firebase/auth";
import { INPUT_CLASS, BTN_SUBMIT } from "@/constants";
export default function SignupForm({ onSuccess }) {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const cred = await signUpWithEmail(email, password);
            await updateProfile(cred.user, { displayName });
            onSuccess?.();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx("div", { className: "rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700", children: error })), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Full Name" }), _jsx("input", { type: "text", required: true, value: displayName, onChange: (e) => setDisplayName(e.target.value), className: INPUT_CLASS, placeholder: "Full Name" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: INPUT_CLASS, placeholder: "you@example.com" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), className: INPUT_CLASS, placeholder: "At least 6 characters" })] }), _jsx("button", { type: "submit", disabled: loading, className: BTN_SUBMIT, children: loading ? "Creating account..." : "Create Account" })] }));
}
