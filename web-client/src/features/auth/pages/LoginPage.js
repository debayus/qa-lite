import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Link } from "react-router-dom";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "../components/LoginForm";
export default function LoginPage() {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated)
        return _jsx(Navigate, { to: ROUTES.DASHBOARD, replace: true });
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-600/30", children: _jsx("span", { className: "text-white text-xl font-bold", children: "Q" }) }), _jsx("h1", { className: "text-2xl font-bold text-white tracking-tight", children: "QALite" }), _jsx("p", { className: "text-slate-400 mt-1 text-sm", children: "Sign in to your account" })] }), _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-8", children: [_jsx(LoginForm, {}), _jsxs("p", { className: "mt-6 text-center text-sm text-gray-500", children: ["Don't have an account?", " ", _jsx(Link, { to: ROUTES.SIGNUP, className: "text-indigo-600 font-semibold hover:text-indigo-700", children: "Sign up" })] })] }), _jsx("p", { className: "text-center text-xs text-slate-600 mt-6", children: "QALite \u00B7 Quality Assurance Made Simple" })] }) }));
}
