import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { BUG_SEVERITIES, INPUT_CLASS, TEXTAREA_CLASS, BTN_PRIMARY, BTN_SECONDARY, } from "@/constants";
import Modal from "@/components/common/Modal";
export default function CreateBugModal({ onClose, onSubmit }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("major");
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ title, description, severity });
            onClose();
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(Modal, { title: "Report Bug", onClose: onClose, children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Title" }), _jsx("input", { autoFocus: true, required: true, value: title, onChange: (e) => setTitle(e.target.value), className: INPUT_CLASS, placeholder: "Bug summary" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 3, className: TEXTAREA_CLASS })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Severity" }), _jsx("div", { className: "flex gap-2", children: BUG_SEVERITIES.map((s) => (_jsx("button", { type: "button", onClick: () => setSeverity(s), className: `flex-1 py-1.5 text-xs rounded-lg border font-semibold capitalize transition-colors ${severity === s
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-400"}`, children: s }, s))) })] }), _jsxs("div", { className: "flex gap-2 justify-end pt-1", children: [_jsx("button", { type: "button", onClick: onClose, className: BTN_SECONDARY, children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading || !title.trim(), className: BTN_PRIMARY, children: loading ? "Saving..." : "Save" })] })] }) }));
}
