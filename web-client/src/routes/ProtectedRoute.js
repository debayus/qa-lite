import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    return isAuthenticated ? _jsx(Outlet, {}) : _jsx(Navigate, { to: ROUTES.LOGIN, replace: true });
}
