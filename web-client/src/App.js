import { jsx as _jsx } from "react/jsx-runtime";
import { useAuthInit } from '@/hooks/useAuth';
import AppRouter from '@/routes';
export default function App() {
    useAuthInit();
    return _jsx(AppRouter, {});
}
