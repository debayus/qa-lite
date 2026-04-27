import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createPortal } from "react-dom";
import { BTN_SECONDARY, BTN_DANGER, BTN_PRIMARY } from "@/constants";
export default function ConfirmModal({ title, description, confirmLabel = "Delete", cancelLabel = "Cancel", danger = true, onConfirm, onCancel, }) {
    return createPortal(_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4", onClick: onCancel, children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("h3", { className: "text-base font-semibold text-gray-900", children: title }), description && (_jsx("p", { className: "text-sm text-gray-500", children: description }))] }), _jsxs("div", { className: "flex justify-end gap-2 pt-1", children: [_jsx("button", { onClick: onCancel, className: BTN_SECONDARY, children: cancelLabel }), _jsx("button", { onClick: onConfirm, className: danger ? BTN_DANGER : BTN_PRIMARY, children: confirmLabel })] })] }) }), document.body);
}
