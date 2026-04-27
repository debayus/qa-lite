import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function EmptyState({ icon, title, description, action, paddingY = "py-16", }) {
    return (_jsxs("div", { className: `flex flex-col items-center justify-center gap-3 text-center ${paddingY}`, children: [icon && _jsx("div", { className: "mb-1", children: icon }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: title }), description && (_jsx("p", { className: "text-sm text-gray-400 mt-0.5", children: description }))] }), action && _jsx("div", { className: "mt-1", children: action })] }));
}
