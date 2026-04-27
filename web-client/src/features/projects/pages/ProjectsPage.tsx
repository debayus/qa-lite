import { useState, useMemo } from "react";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { useAuth } from "@/hooks/useAuth";
import { STARTER_LIMITS, BTN_PRIMARY } from "@/constants";
import {
  PlusIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from "@/components/ui/Icons";
import AlertBanner from "@/components/common/AlertBanner";
import PageHeader from "@/components/common/PageHeader";

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-1.5 w-full bg-gray-200" />
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-14" />
          ))}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-2 w-12 bg-gray-100 rounded" />
            <div className="h-2 w-8 bg-gray-100 rounded" />
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, createProject, renameProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const atLimit =
    user?.entitlement === "free" &&
    projects.length >= STARTER_LIMITS.maxProjects;

  const filtered = useMemo(
    () =>
      search.trim()
        ? projects.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase()),
          )
        : projects,
    [projects, search],
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Projects"
        subtitle={loading ? "..." : `${projects.length} active projects`}
        action={
          <button
            onClick={() => setShowModal(true)}
            disabled={atLimit}
            title={
              atLimit
                ? `Starter plan allows ${STARTER_LIMITS.maxProjects} project. Upgrade to Pro.`
                : undefined
            }
            className={BTN_PRIMARY}
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
        }
      />

      {/* Limit warning */}
      {atLimit && (
        <AlertBanner
          message={
            <>
              Starter plan supports {STARTER_LIMITS.maxProjects} active project.{" "}
              <span className="font-semibold">Upgrade to Pro</span> for
              unlimited projects.
            </>
          }
        />
      )}

      {/* Search bar — only show when there's something to search */}
      {!loading && projects.length > 0 && (
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full sm:w-72 pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <FolderIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800">
              No projects yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first project to start testing
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-1 flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Create First Project
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <MagnifyingGlassIcon className="w-10 h-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            No projects matching <span className="font-medium">"{search}"</span>
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-sm text-indigo-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onRename={renameProject} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={createProject}
        />
      )}
    </div>
  );
}
