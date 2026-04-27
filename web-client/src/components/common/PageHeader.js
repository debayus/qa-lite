import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function PageHeader({ title, subtitle, action }) {
    return (_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold text-gray-900", children: title }), subtitle && _jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: subtitle })] }), action && _jsx("div", { className: "shrink-0", children: action })] }));
}
