import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

/* ── SVG Icons ── */
const OverviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const TasksIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
    <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);
const PatientsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 8h4m-4 4h10m-10 4h6" strokeLinecap="round" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const CollapseIcon = ({ collapsed }) => (
  <svg
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    className={`w-5 h-5 shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const NAV_ITEMS = [
  { to: "/nurse", label: "Overview", icon: <OverviewIcon />, end: true },
  { to: "/nurse/tasks", label: "My Tasks", icon: <TasksIcon /> },
  { to: "/nurse/patients", label: "My Patients", icon: <PatientsIcon /> },
];

const NurseSidebar = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuthStore();

  return (
    <aside
      className={`bg-[#1a2b4a] text-white flex flex-col h-screen sticky top-0
        transition-all duration-300 ease-in-out ${collapsed ? "w-[68px]" : "w-60"}`}
    >
      {/* Brand + Toggle */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-white/10">
        {!collapsed && (
          <span className="font-bold tracking-wider text-sm pl-2 whitespace-nowrap">
            MEDCARE
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${collapsed ? "mx-auto" : ""}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold
              transition-all duration-200 group relative
              ${isActive
                ? "bg-[#0066cc] text-white shadow-md shadow-blue-900/30"
                : "text-gray-300 hover:bg-white/10 hover:text-white"}`
            }
          >
            {icon}
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-[#1a2b4a] border border-white/10
                text-xs text-white whitespace-nowrap opacity-0 pointer-events-none
                group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4">
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold
            text-pink-300 hover:bg-pink-500/10 hover:text-pink-200 transition-all duration-200 group relative`}
        >
          <LogoutIcon />
          {!collapsed && <span>Logout</span>}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-[#1a2b4a] border border-white/10
              text-xs text-white whitespace-nowrap opacity-0 pointer-events-none
              group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default NurseSidebar;
