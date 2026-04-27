import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
export default function AppShell() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "flex h-screen overflow-hidden bg-gray-50", children: [sidebarOpen && (_jsx("div", { className: "fixed inset-0 z-20 bg-black/50 md:hidden", onClick: () => setSidebarOpen(false) })), _jsx(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }), _jsxs("div", { className: "flex flex-col flex-1 overflow-hidden", children: [_jsx(Topbar, { onMenuClick: () => setSidebarOpen(true) }), _jsx("main", { className: "flex-1 overflow-y-auto p-4 md:p-6", children: _jsx(Outlet, {}) })] })] }));
}
