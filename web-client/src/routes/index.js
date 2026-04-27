import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from '@/constants';
import ProtectedRoute from './ProtectedRoute';
import ProjectRoute from './ProjectRoute';
import AppShell from '@/components/layout/AppShell';
import LoginPage from '@/features/auth/pages/LoginPage';
import SignupPage from '@/features/auth/pages/SignupPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ProjectsPage from '@/features/projects/pages/ProjectsPage';
import ScenariosPage from '@/features/scenarios/pages/ScenariosPage';
import TestCasesPage from '@/features/test-cases/pages/TestCasesPage';
import ExecutionPage from '@/features/execution/pages/ExecutionPage';
import BugsPage from '@/features/bugs/pages/BugsPage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import MembersPage from '@/features/members/pages/MembersPage';
import BillingPage from '@/features/billing/pages/BillingPage';
const router = createBrowserRouter([
    { path: ROUTES.LOGIN, element: _jsx(LoginPage, {}) },
    { path: ROUTES.SIGNUP, element: _jsx(SignupPage, {}) },
    {
        path: '/',
        element: _jsx(ProtectedRoute, {}),
        children: [
            {
                element: _jsx(AppShell, {}),
                children: [
                    { index: true, element: _jsx(DashboardPage, {}) },
                    { path: 'projects', element: _jsx(ProjectsPage, {}) },
                    {
                        path: 'projects/:projectId',
                        element: _jsx(ProjectRoute, {}),
                        children: [
                            { path: 'scenarios', element: _jsx(ScenariosPage, {}) },
                            { path: 'scenarios/:scenarioId', element: _jsx(TestCasesPage, {}) },
                            { path: 'execution', element: _jsx(ExecutionPage, {}) },
                            { path: 'bugs', element: _jsx(BugsPage, {}) },
                            { path: 'reports', element: _jsx(ReportsPage, {}) },
                            { path: 'members', element: _jsx(MembersPage, {}) },
                        ],
                    },
                    { path: 'billing', element: _jsx(BillingPage, {}) },
                ],
            },
        ],
    },
]);
export default function AppRouter() {
    return _jsx(RouterProvider, { router: router });
}
