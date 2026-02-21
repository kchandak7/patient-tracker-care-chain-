import { useAuthStore } from "../../store/useAuthStore";

const NurseTopbar = ({ collapsed, setCollapsed }) => {
  const { authUser } = useAuthStore();

  return (
    <div
      className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20"
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-600">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div>
          <h2 className="text-sm font-bold text-[#1a2b4a]">Nurse Dashboard</h2>
          <p className="text-xs text-gray-400">
            Welcome back, {authUser?.name || "Nurse"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold
        border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Online
      </div>
    </div>
  );
};

export default NurseTopbar;
