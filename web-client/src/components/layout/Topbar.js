import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "@/hooks/useAuth";
import { Bars3Icon } from "@/components/ui/Icons";
export default function Topbar({ onMenuClick }) {
    const { user } = useAuth();
    return (_jsxs("header", { className: "h-14 shrink-0 border-b border-gray-100 bg-white flex items-center px-4 md:px-6 gap-3", children: [_jsx("button", { onClick: onMenuClick, className: "md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors", children: _jsx(Bars3Icon, { className: "w-5 h-5" }) }), _jsxs("span", { className: "text-sm text-gray-400", children: ["Hi,", " ", _jsx("span", { className: "font-medium text-gray-700", children: user?.displayName ?? "Tester" })] })] }));
}
