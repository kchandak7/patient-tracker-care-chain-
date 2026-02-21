import { useEffect } from "react";
import { useNurseStore } from "../../store/useNurseStore";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatCard from "../components/StatCard";

/* ── Tiny SVG Helpers ── */
const TaskIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);
const PatientIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" />
    <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Mini Donut Chart ── */
const DonutChart = ({ data, size = 140, strokeWidth = 18 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xs text-gray-300">No data</span>
      </div>
    );
  }
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} className="block mx-auto">
      {data.map((d, i) => {
        const segLen = (d.value / total) * circumference;
        const dash = `${segLen} ${circumference - segLen}`;
        const seg = (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        );
        offset += segLen;
        return seg;
      })}
      <text x="50%" y="50%" textAnchor="middle" dy=".35em"
        className="fill-[#1a2b4a] text-lg font-bold">{total}</text>
    </svg>
  );
};

const NurseDashboard = () => {
  const { tasks, fetchTasks, isLoadingTasks, patients, fetchPatients, isLoadingPatients, profile, fetchProfile } =
    useNurseStore();

  useEffect(() => {
    fetchTasks();
    fetchPatients();
    fetchProfile();
  }, [fetchTasks, fetchPatients, fetchProfile]);

  const isLoading = isLoadingTasks || isLoadingPatients;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  // Upcoming tasks (pending/in-progress, sorted by scheduledAt or dueDate)
  const upcomingTasks = [...pendingTasks, ...inProgressTasks]
    .sort((a, b) => {
      const aDate = new Date(a.scheduledAt || a.dueDate || a.createdAt);
      const bDate = new Date(b.scheduledAt || b.dueDate || b.createdAt);
      return aDate - bDate;
    })
    .slice(0, 3);

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short",
    });
  };

  const statusColors = [
    { label: "Pending", value: pendingTasks.length, color: "#d97706" },
    { label: "In Progress", value: inProgressTasks.length, color: "#0066cc" },
    { label: "Completed", value: completedTasks.length, color: "#059669" },
  ];

  const typeData = [
    { label: "Medication", value: tasks.filter((t) => t.taskType === "MEDICATION").length, color: "#7c3aed" },
    { label: "Test", value: tasks.filter((t) => t.taskType === "TEST").length, color: "#0891b2" },
    { label: "Vitals", value: tasks.filter((t) => t.taskType === "VITALS").length, color: "#ea580c" },
  ];

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<TaskIcon />}
          label="Total Tasks"
          value={tasks.length}
          gradient="linear-gradient(135deg, #0066cc 0%, #0088ff 100%)"
          iconBg="rgba(255,255,255,0.2)"
        />
        <StatCard
          icon={<ClockIcon />}
          label="Pending"
          value={pendingTasks.length}
          gradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
          iconBg="rgba(255,255,255,0.2)"
        />
        <StatCard
          icon={<PatientIcon />}
          label="My Patients"
          value={patients.length}
          gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
          iconBg="rgba(255,255,255,0.2)"
        />
        <StatCard
          icon={<CheckIcon />}
          label="Completed"
          value={completedTasks.length}
          gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
          iconBg="rgba(255,255,255,0.2)"
        />
      </div>

      {/* Charts + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Task Status Donut */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#0066cc] rounded-full" />
            <h3 className="text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">
              Task Status
            </h3>
          </div>
          <DonutChart data={statusColors} />
          <div className="flex justify-center gap-4 mt-4">
            {statusColors.map((d) => (
              <div key={d.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.label} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Task Type Donut */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#7c3aed] rounded-full" />
            <h3 className="text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">
              Task Types
            </h3>
          </div>
          <DonutChart data={typeData} />
          <div className="flex justify-center gap-4 mt-4">
            {typeData.map((d) => (
              <div key={d.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.label} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col" style={{ maxHeight: 380 }}>
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <div className="w-1 h-5 bg-amber-500 rounded-full" />
            <h3 className="text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">
              Upcoming Tasks ({upcomingTasks.length})
            </h3>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8">No pending tasks</div>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-1 admin-scroll">
              {upcomingTasks.map((t) => (
                <div key={t._id} className="flex items-center gap-3 p-2.5 rounded-md bg-[#f8fafc] border border-gray-100">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    t.status === "PENDING" ? "bg-amber-400" : "bg-blue-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#1a2b4a] font-medium truncate">{t.description}</div>
                    <div className="text-xs text-gray-400">
                      {t.patientId?.name || "—"} • {fmtDate(t.scheduledAt || t.dueDate)}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                    t.taskType === "MEDICATION"
                      ? "bg-purple-100 text-purple-600"
                      : t.taskType === "TEST"
                        ? "bg-cyan-100 text-cyan-600"
                        : "bg-orange-100 text-orange-600"
                  }`}>
                    {t.taskType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Doctor Info */}
      {profile?.doctorId?.userId && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#059669] rounded-full" />
            <h3 className="text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">
              Assigned Doctor
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0066cc] text-white flex items-center justify-center text-sm font-bold">
              {profile.doctorId.userId.name?.charAt(0)?.toUpperCase() || "D"}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1a2b4a]">
                Dr. {profile.doctorId.userId.name}
              </div>
              <div className="text-xs text-gray-400">{profile.doctorId.userId.email}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NurseDashboard;
