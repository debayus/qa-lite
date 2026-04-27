import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { INPUT_CLASS, BTN_PRIMARY, BTN_SECONDARY } from "@/constants";
import Modal from "@/components/common/Modal";
export default function CreateRunModal({ defaultName, onSubmit, onClose, subtitle, }) {
    const [name, setName] = useState(defaultName);
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(name.trim() || defaultName);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(Modal, { title: "Create New Run", subtitle: subtitle ?? "All test cases from this scenario will be included.", onClose: onClose, maxWidth: "max-w-sm", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Run Name" }), _jsx("input", { autoFocus: true, value: name, onChange: (e) => setName(e.target.value), required: true, placeholder: defaultName, className: INPUT_CLASS })] }), _jsxs("div", { className: "flex gap-2 justify-end pt-1", children: [_jsx("button", { type: "button", onClick: onClose, className: BTN_SECONDARY, children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: BTN_PRIMARY, children: loading ? "Creating..." : "Create Run" })] })] }) }));
}
