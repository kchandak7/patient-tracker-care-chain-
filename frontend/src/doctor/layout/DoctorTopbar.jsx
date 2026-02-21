import { useAuthStore } from "../../store/useAuthStore";

const DoctorTopbar = ({ collapsed, setCollapsed }) => {
  const { authUser } = useAuthStore();

  return (
    <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#1a2b4a]">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <div className="text-sm font-bold text-[#1a2b4a]">
            Doctor Dashboard
          </div>
          <div className="text-xs text-gray-500">
            Welcome back, Dr. {authUser?.name || "Doctor"}
          </div>
        </div>
      </div>

      <span className="text-xs bg-green-100 text-green-700 border border-green-300 px-2 py-1 rounded-sm font-medium">
        ● Online
      </span>
    </div>
  );
};

export default DoctorTopbar;
