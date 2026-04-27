import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { INPUT_CLASS, BTN_PRIMARY, BTN_SECONDARY } from "@/constants";
import Modal from "@/components/common/Modal";
const ROLES = ["admin", "tester", "viewer"];
export default function InviteModal({ projectId, onClose, onInvite }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("tester");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await onInvite(projectId, email.trim(), role);
            onClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add member.");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(Modal, { title: "Invite Member", onClose: onClose, maxWidth: "max-w-sm", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx("div", { className: "rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700", children: error })), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { autoFocus: true, type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "member@example.com", className: INPUT_CLASS })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Role" }), _jsx("select", { value: role, onChange: (e) => setRole(e.target.value), className: INPUT_CLASS, children: ROLES.map((r) => (_jsx("option", { value: r, children: r }, r))) })] }), _jsxs("div", { className: "flex gap-2 justify-end pt-1", children: [_jsx("button", { type: "button", onClick: onClose, className: BTN_SECONDARY, children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: BTN_PRIMARY, children: loading ? "Sending..." : "Invite" })] })] }) }));
}
