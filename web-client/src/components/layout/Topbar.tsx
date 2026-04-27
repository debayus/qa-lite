import { useAuth } from "@/hooks/useAuth";
import { Bars3Icon } from "@/components/ui/Icons";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();

  return (
    <header className="h-14 shrink-0 border-b border-gray-100 bg-white flex items-center px-4 md:px-6 gap-3">
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>
      <span className="text-sm text-gray-400">
        Hi,{" "}
        <span className="font-medium text-gray-700">
          {user?.displayName ?? "Tester"}
        </span>
      </span>
    </header>
  );
}
