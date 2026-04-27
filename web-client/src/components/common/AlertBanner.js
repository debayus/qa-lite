import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const STYLES = {
    warning: {
        wrap: "bg-amber-50 border-amber-200",
        text: "text-amber-700",
        icon: "⚠",
    },
    error: { wrap: "bg-red-50 border-red-200", text: "text-red-700", icon: "✕" },
    info: {
        wrap: "bg-blue-50 border-blue-200",
        text: "text-blue-700",
        icon: "ℹ",
    },
};
export default function AlertBanner({ message, variant = "warning" }) {
    const s = STYLES[variant];
    return (_jsxs("div", { className: `flex items-start gap-3 border rounded-xl px-4 py-3 ${s.wrap}`, children: [_jsx("span", { className: `text-base mt-0.5 shrink-0 ${s.text}`, children: s.icon }), _jsx("p", { className: `text-sm ${s.text}`, children: message })] }));
}
