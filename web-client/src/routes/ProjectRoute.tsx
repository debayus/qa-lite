import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useProject } from '@/features/projects/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

export default function ProjectRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { project, loading } = useProject(projectId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project || !user || !(user.uid in project.members)) {
    return <Navigate to={ROUTES.PROJECTS} replace />;
  }

  return <Outlet />;
}
