import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Modal from "@/components/common/Modal";
import { INPUT_CLASS, BTN_PRIMARY, BTN_SECONDARY } from "@/constants";
export default function CreateProjectModal({ onClose, onCreate }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim())
            return;
        setLoading(true);
        try {
            await onCreate(name.trim());
            onClose();
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(Modal, { title: "Create New Project", onClose: onClose, maxWidth: "max-w-sm", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Project Name" }), _jsx("input", { autoFocus: true, type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Mobile App v2.0", className: INPUT_CLASS })] }), _jsxs("div", { className: "flex gap-2 justify-end pt-1", children: [_jsx("button", { type: "button", onClick: onClose, className: BTN_SECONDARY, children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading || !name.trim(), className: BTN_PRIMARY, children: loading ? "Creating..." : "Create Project" })] })] }) }));
}
