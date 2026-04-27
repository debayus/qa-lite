import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { ROUTES, projectRoutes } from "@/constants";
import {
  SparklesIcon,
  FolderIcon,
  ClipboardListIcon,
  BugAntIcon,
  ChartBarIcon,
  PlayIcon,
  CreditCardIcon,
} from "@/components/ui/Icons";

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, loading } = useProjects();
  const isPro = user?.entitlement === "pro";

  const totalProjects = projects.length;
  const totalTestCases = projects.reduce(
    (sum, p) => sum + (p.stats?.totalTestCases ?? 0),
    0,
  );
  const openBugs = projects.reduce(
    (sum, p) => sum + (p.stats?.openBugs ?? 0),
    0,
  );
  const passed = projects.reduce(
    (sum, p) => sum + (p.stats?.passedTestCases ?? 0),
    0,
  );
  const passRate =
    totalTestCases > 0 ? Math.round((passed / totalTestCases) * 100) : null;

  const firstProject = projects[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 text-white shadow-md shadow-indigo-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">
              Selamat datang kembali
            </p>
            <h1 className="text-2xl font-bold">
              {user?.displayName ?? "Tester"} 👋
            </h1>
            <p className="text-indigo-200 text-sm mt-2">
              Paket aktif:{" "}
              <span className="font-semibold text-white">
                {isPro ? "Pro" : "Starter (Gratis)"}
              </span>
              {!isPro && (
                <Link
                  to={ROUTES.BILLING}
                  className="ml-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full transition-colors"
                >
                  Upgrade →
                </Link>
              )}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Proyek"
            value={totalProjects}
            color="text-indigo-600"
          />
          <StatCard
            label="Total Test Case"
            value={totalTestCases}
            color="text-blue-600"
          />
          <StatCard
            label="Bug Terbuka"
            value={openBugs}
            sub={openBugs > 0 ? "Perlu ditangani" : "Semua bersih 🎉"}
            color={openBugs > 0 ? "text-red-500" : "text-green-600"}
          />
          <StatCard
            label="Pass Rate"
            value={passRate !== null ? `${passRate}%` : "—"}
            sub={
              totalTestCases > 0
                ? `${passed} dari ${totalTestCases} lulus`
                : "Belum ada data"
            }
            color={
              passRate !== null && passRate >= 80
                ? "text-green-600"
                : passRate !== null
                  ? "text-orange-500"
                  : "text-gray-400"
            }
          />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Akses Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link
            to={ROUTES.PROJECTS}
            className="group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
          >
            <FolderIcon className="w-5 h-5 text-indigo-500 mb-2" />
            <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600">
              Proyek
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Lihat semua proyek</p>
          </Link>

          {firstProject ? (
            <Link
              to={projectRoutes.scenarios(firstProject.id)}
              className="group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <ClipboardListIcon className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                Skenario
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {firstProject.name}
              </p>
            </Link>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
              <ClipboardListIcon className="w-5 h-5 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-400">Skenario</p>
              <p className="text-xs text-gray-400 mt-0.5">Buat proyek dulu</p>
            </div>
          )}

          {firstProject ? (
            <Link
              to={projectRoutes.execution(firstProject.id)}
              className="group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <PlayIcon className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-sm font-semibold text-gray-800 group-hover:text-green-600">
                Eksekusi
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {firstProject.name}
              </p>
            </Link>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
              <PlayIcon className="w-5 h-5 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-400">Eksekusi</p>
              <p className="text-xs text-gray-400 mt-0.5">Buat proyek dulu</p>
            </div>
          )}

          {firstProject ? (
            <Link
              to={projectRoutes.bugs(firstProject.id)}
              className="group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
            >
              <BugAntIcon className="w-5 h-5 text-red-500 mb-2" />
              <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600">
                Bug
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {firstProject.name}
              </p>
            </Link>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
              <BugAntIcon className="w-5 h-5 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-400">Bug</p>
              <p className="text-xs text-gray-400 mt-0.5">Buat proyek dulu</p>
            </div>
          )}

          {firstProject ? (
            <Link
              to={projectRoutes.reports(firstProject.id)}
              className="group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <ChartBarIcon className="w-5 h-5 text-purple-500 mb-2" />
              <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-600">
                Laporan
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {firstProject.name}
              </p>
            </Link>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
              <ChartBarIcon className="w-5 h-5 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-400">Laporan</p>
              <p className="text-xs text-gray-400 mt-0.5">Buat proyek dulu</p>
            </div>
          )}

          {!isPro && (
            <Link
              to={ROUTES.BILLING}
              className="group bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <CreditCardIcon className="w-5 h-5 text-indigo-400 mb-2" />
              <p className="text-sm font-semibold text-indigo-700">
                Upgrade ke Pro
              </p>
              <p className="text-xs text-indigo-400 mt-0.5">
                Fitur tanpa batas
              </p>
            </Link>
          )}
        </div>
      </div>

      {/* Getting started (only if no projects) */}
      {!loading && totalProjects === 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Mulai dari sini
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Buat Proyek",
                desc: "Mulai dengan membuat proyek baru di halaman Proyek.",
                step: "1",
              },
              {
                label: "Tambah Skenario",
                desc: "Atur test case ke dalam skenario yang terstruktur.",
                step: "2",
              },
              {
                label: "Lacak Bug",
                desc: "Laporkan dan pantau bug dengan papan Kanban.",
                step: "3",
              },
            ].map((tip) => (
              <div
                key={tip.step}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold mb-3">
                  {tip.step}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {tip.label}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
