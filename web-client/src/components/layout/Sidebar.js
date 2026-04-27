import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useMatch } from "react-router-dom";
import { cn } from "@/lib/utils/cn";
import { ROUTES, projectRoutes } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import { HomeIcon, FolderIcon, ClipboardListIcon, PlayIcon, BugAntIcon, ChartBarIcon, UsersIcon, CreditCardIcon, ArrowRightOnRectangleIcon, XMarkIcon, } from "@/components/ui/Icons";
const mainNav = [
    { label: "Dashboard", to: ROUTES.DASHBOARD, end: true, icon: HomeIcon },
    { label: "Projects", to: ROUTES.PROJECTS, icon: FolderIcon },
];
const projectSubNav = [
    { label: "Scenarios", key: "scenarios", icon: ClipboardListIcon },
    { label: "Execution", key: "execution", icon: PlayIcon },
    { label: "Bugs", key: "bugs", icon: BugAntIcon },
    { label: "Reports", key: "reports", icon: ChartBarIcon },
    { label: "Members", key: "members", icon: UsersIcon },
];
function SidebarLink({ to, end, icon: Icon, children, }) {
    return (_jsxs(NavLink, { to: to, end: end, className: ({ isActive }) => cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive
            ? "bg-indigo-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"), children: [_jsx(Icon, { className: "w-[17px] h-[17px] shrink-0" }), children] }));
}
export default function Sidebar({ isOpen, onClose, }) {
    const { user } = useAuth();
    const projectMatch = useMatch("/projects/:projectId/*");
    const projectId = projectMatch?.params.projectId;
    const initials = user?.displayName
        ? user.displayName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : (user?.email?.[0]?.toUpperCase() ?? "?");
    function projectNav(key) {
        if (!projectId)
            return "#";
        const map = {
            scenarios: projectRoutes.scenarios(projectId),
            execution: projectRoutes.execution(projectId),
            bugs: projectRoutes.bugs(projectId),
            reports: projectRoutes.reports(projectId),
            members: projectRoutes.members(projectId),
        };
        return map[key];
    }
    return (_jsxs("aside", { className: cn("w-60 shrink-0 bg-slate-900 flex flex-col h-full", "fixed inset-y-0 left-0 z-30 transition-transform duration-300", "md:relative md:translate-x-0", isOpen ? "translate-x-0" : "-translate-x-full"), children: [_jsxs("div", { className: "h-14 flex items-center px-4 border-b border-slate-800", children: [_jsxs("div", { className: "flex items-center gap-2.5 flex-1", children: [_jsx("div", { className: "w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0", children: _jsx("span", { className: "text-white text-xs font-bold leading-none", children: "Q" }) }), _jsx("span", { className: "text-white font-semibold text-sm tracking-tight", children: "QALite" })] }), _jsx("button", { onClick: onClose, className: "md:hidden text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors", children: _jsx(XMarkIcon, { className: "w-4 h-4" }) })] }), _jsxs("nav", { className: "flex-1 px-2 py-3 space-y-0.5 overflow-y-auto", children: [mainNav.map((item) => (_jsx(SidebarLink, { to: item.to, end: item.end, icon: item.icon, children: item.label }, item.to))), projectId && (_jsxs("div", { className: "pt-4 mt-2", children: [_jsx("p", { className: "px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest", children: "Active Project" }), _jsx("div", { className: "space-y-0.5", children: projectSubNav.map(({ label, key, icon }) => (_jsx(SidebarLink, { to: projectNav(key), icon: icon, children: label }, key))) })] })), _jsx("div", { className: "pt-3 mt-3 border-t border-slate-800/60", children: _jsx(SidebarLink, { to: ROUTES.BILLING, icon: CreditCardIcon, children: "Billing" }) })] }), _jsx("div", { className: "border-t border-slate-800 p-3", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0", children: _jsx("span", { className: "text-white text-xs font-semibold", children: initials }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs text-slate-300 truncate leading-tight", children: user?.email }), _jsx("span", { className: cn("text-[10px] font-medium", user?.entitlement === "pro"
                                        ? "text-indigo-400"
                                        : "text-slate-500"), children: user?.entitlement === "pro" ? "Pro" : "Starter" })] }), _jsx("button", { onClick: () => signOut(), className: "text-slate-500 hover:text-slate-300 transition-colors shrink-0 p-1 rounded-md hover:bg-slate-800", title: "Sign out", children: _jsx(ArrowRightOnRectangleIcon, { className: "w-4 h-4" }) })] }) })] }));
}
