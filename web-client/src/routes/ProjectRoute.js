import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useProject } from '@/features/projects/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
export default function ProjectRoute() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { project, loading } = useProject(projectId);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    if (!project || !user || !(user.uid in project.members)) {
        return _jsx(Navigate, { to: ROUTES.PROJECTS, replace: true });
    }
    return _jsx(Outlet, {});
}
