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
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  { path: ROUTES.SIGNUP, element: <SignupPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'projects', element: <ProjectsPage /> },
          {
            path: 'projects/:projectId',
            element: <ProjectRoute />,
            children: [
              { path: 'scenarios', element: <ScenariosPage /> },
              { path: 'scenarios/:scenarioId', element: <TestCasesPage /> },
              { path: 'execution', element: <ExecutionPage /> },
              { path: 'bugs', element: <BugsPage /> },
              { path: 'reports', element: <ReportsPage /> },
              { path: 'members', element: <MembersPage /> },
            ],
          },
          { path: 'billing', element: <BillingPage /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
