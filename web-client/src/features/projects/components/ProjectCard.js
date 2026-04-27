import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils/cn";
import { projectRoutes } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardListIcon, BugAntIcon, ChevronRightIcon, UsersIcon, PencilIcon, } from "@/components/ui/Icons";
const ACCENT_COLORS = [
    { bg: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600" },
    { bg: "bg-violet-500", light: "bg-violet-50", text: "text-violet-600" },
    { bg: "bg-sky-500", light: "bg-sky-50", text: "text-sky-600" },
    { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600" },
    { bg: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600" },
    { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600" },
    { bg: "bg-cyan-500", light: "bg-cyan-50", text: "text-cyan-600" },
    { bg: "bg-pink-500", light: "bg-pink-50", text: "text-pink-600" },
];
function getAccent(str) {
    let hash = 0;
    for (const c of str)
        hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}
const ROLE_STYLE = {
    admin: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    tester: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    viewer: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
};
export default function ProjectCard({ project, onRename }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const role = user ? project.members[user.uid] : undefined;
    const accent = getAccent(project.name);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(project.name);
    const inputRef = useRef(null);
    function startEdit(e) {
        e.stopPropagation();
        setEditName(project.name);
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    }
    async function commitEdit() {
        setEditing(false);
        if (editName.trim() && editName.trim() !== project.name) {
            await onRename?.(project.id, editName.trim());
        }
    }
    function handleKeyDown(e) {
        if (e.key === "Enter")
            commitEdit();
        if (e.key === "Escape")
            setEditing(false);
    }
    const passRate = project.stats.totalTestCases > 0
        ? Math.round((project.stats.passedTestCases / project.stats.totalTestCases) * 100)
        : null;
    const barColor = passRate === null
        ? "bg-gray-200"
        : passRate >= 90
            ? "bg-emerald-500"
            : passRate >= 70
                ? "bg-yellow-400"
                : "bg-red-400";
    const passRateText = passRate === null
        ? "—"
        : passRate >= 90
            ? "text-emerald-600"
            : passRate >= 70
                ? "text-yellow-600"
                : "text-red-500";
    return (_jsxs("div", { onClick: () => navigate(projectRoutes.scenarios(project.id)), className: "group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 cursor-pointer transition-all duration-200 flex flex-col", children: [_jsx("div", { className: cn("h-1.5 w-full", accent.bg) }), _jsxs("div", { className: "p-5 flex flex-col gap-4 flex-1", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-base", accent.bg), children: project.name.charAt(0).toUpperCase() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [editing ? (_jsx("input", { ref: inputRef, value: editName, onChange: (e) => setEditName(e.target.value), onBlur: commitEdit, onKeyDown: handleKeyDown, onClick: (e) => e.stopPropagation(), className: "flex-1 min-w-0 text-sm font-semibold text-gray-900 border-b border-indigo-400 bg-transparent outline-none leading-snug" })) : (_jsx("h3", { className: "font-semibold text-gray-900 text-sm leading-snug line-clamp-1 flex-1", children: project.name })), role === "admin" && !editing && onRename && (_jsx("button", { onClick: startEdit, className: "shrink-0 p-0.5 rounded text-gray-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity", title: "Rename project", children: _jsx(PencilIcon, { className: "w-3.5 h-3.5" }) })), role && (_jsx("span", { className: cn("shrink-0 text-[10px] rounded-full px-2 py-0.5 font-semibold capitalize", ROLE_STYLE[role] ?? "bg-gray-100 text-gray-600"), children: role }))] }), _jsxs("p", { className: "text-[11px] text-gray-400 mt-0.5 flex items-center gap-1", children: [_jsx(UsersIcon, { className: "w-3 h-3" }), Object.keys(project.members).length, " anggota"] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx(StatBox, { icon: _jsx(ClipboardListIcon, { className: "w-3.5 h-3.5" }), label: "Test Cases", value: project.stats.totalTestCases, accent: accent.light, textColor: accent.text }), _jsx(StatBox, { icon: _jsx("svg", { className: "w-3.5 h-3.5", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), label: "Pass Rate", value: passRate !== null ? `${passRate}%` : "—", accent: passRate === null
                                    ? "bg-gray-50"
                                    : passRate >= 90
                                        ? "bg-emerald-50"
                                        : passRate >= 70
                                            ? "bg-yellow-50"
                                            : "bg-red-50", textColor: passRate === null ? "text-gray-400" : passRateText }), _jsx(StatBox, { icon: _jsx(BugAntIcon, { className: "w-3.5 h-3.5" }), label: "Open Bugs", value: project.stats.openBugs, accent: project.stats.openBugs > 0 ? "bg-red-50" : "bg-gray-50", textColor: project.stats.openBugs > 0 ? "text-red-500" : "text-gray-400" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("span", { className: "text-[10px] text-gray-400 font-medium", children: "Progress" }), _jsx("span", { className: cn("text-[10px] font-semibold", passRate !== null ? passRateText : "text-gray-400"), children: passRate !== null ? `${passRate}%` : "Belum ada test" })] }), _jsx("div", { className: "h-1.5 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: cn("h-full rounded-full transition-all duration-500", barColor), style: { width: passRate !== null ? `${passRate}%` : "0%" } }) })] }), _jsx("div", { className: "flex items-center justify-end pt-0.5", children: _jsxs("span", { className: cn("text-xs font-semibold flex items-center gap-0.5 transition-colors", accent.text), children: ["Buka", _jsx(ChevronRightIcon, { className: "w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" })] }) })] })] }));
}
function StatBox({ icon, label, value, accent, textColor, }) {
    return (_jsxs("div", { className: cn("rounded-xl px-3 py-2.5 flex flex-col gap-1", accent), children: [_jsxs("div", { className: cn("flex items-center gap-1", textColor), children: [icon, _jsx("span", { className: "text-[10px] font-medium truncate", children: label })] }), _jsx("span", { className: cn("text-base font-bold leading-none", textColor), children: value })] }));
}
