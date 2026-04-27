import { NavLink, useMatch } from "react-router-dom";
import { cn } from "@/lib/utils/cn";
import { ROUTES, projectRoutes } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import {
  HomeIcon,
  FolderIcon,
  ClipboardListIcon,
  PlayIcon,
  BugAntIcon,
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@/components/ui/Icons";

const mainNav = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, end: true, icon: HomeIcon },
  { label: "Projects", to: ROUTES.PROJECTS, icon: FolderIcon },
];

const projectSubNav = [
  { label: "Scenarios", key: "scenarios", icon: ClipboardListIcon },
  { label: "Execution", key: "execution", icon: PlayIcon },
  { label: "Bugs", key: "bugs", icon: BugAntIcon },
  { label: "Reports", key: "reports", icon: ChartBarIcon },
  { label: "Members", key: "members", icon: UsersIcon },
] as const;

type SubNavKey = (typeof projectSubNav)[number]["key"];

function SidebarLink({
  to,
  end,
  icon: Icon,
  children,
}: {
  to: string;
  end?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
        )
      }
    >
      <Icon className="w-[17px] h-[17px] shrink-0" />
      {children}
    </NavLink>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const projectMatch = useMatch("/projects/:projectId/*");
  const projectId = projectMatch?.params.projectId;

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  function projectNav(key: SubNavKey) {
    if (!projectId) return "#";
    const map: Record<SubNavKey, string> = {
      scenarios: projectRoutes.scenarios(projectId),
      execution: projectRoutes.execution(projectId),
      bugs: projectRoutes.bugs(projectId),
      reports: projectRoutes.reports(projectId),
      members: projectRoutes.members(projectId),
    };
    return map[key];
  }

  return (
    <aside
      className={cn(
        "w-60 shrink-0 bg-slate-900 flex flex-col h-full",
        "fixed inset-y-0 left-0 z-30 transition-transform duration-300",
        "md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold leading-none">Q</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            QALite
          </span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {mainNav.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            end={item.end}
            icon={item.icon}
          >
            {item.label}
          </SidebarLink>
        ))}

        {projectId && (
          <div className="pt-4 mt-2">
            <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Active Project
            </p>
            <div className="space-y-0.5">
              {projectSubNav.map(({ label, key, icon }) => (
                <SidebarLink key={key} to={projectNav(key)} icon={icon}>
                  {label}
                </SidebarLink>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 mt-3 border-t border-slate-800/60">
          <SidebarLink to={ROUTES.BILLING} icon={CreditCardIcon}>
            Billing
          </SidebarLink>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 truncate leading-tight">
              {user?.email}
            </p>
            <span
              className={cn(
                "text-[10px] font-medium",
                user?.entitlement === "pro"
                  ? "text-indigo-400"
                  : "text-slate-500",
              )}
            >
              {user?.entitlement === "pro" ? "Pro" : "Starter"}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 p-1 rounded-md hover:bg-slate-800"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
