import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@/components/ui/Icons";
export default function Modal({ title, subtitle, onClose, children, maxWidth = "max-w-md", }) {
    return createPortal(_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4", onClick: onClose, children: _jsxs("div", { className: `bg-white rounded-2xl w-full ${maxWidth} shadow-2xl`, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-gray-100", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-semibold text-gray-900", children: title }), subtitle && (_jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: subtitle }))] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 shrink-0 mt-0.5", children: _jsx(XMarkIcon, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "px-6 py-5", children: children })] }) }), document.body);
}
