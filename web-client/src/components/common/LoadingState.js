import { jsx as _jsx } from "react/jsx-runtime";
export default function LoadingState({ text = "Loading...", className }) {
    return (_jsx("div", { className: `text-sm text-gray-400 py-12 text-center ${className ?? ""}`, children: text }));
}
