import { useEffect, useMemo } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import LoadingSpinner from "../../components/LoadingSpinner";

/* ── Custom scrollbar styles injected once ── */
const scrollbarCSS = ``;

/* ── SVG icon components ── */
const DoctorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z" />
    <path d="M20 21c0-3.3-3.6-6-8-6s-8 2.7-8 6" />
    <path d="M12 16v4m-2-2h4" strokeLinecap="round" />
  </svg>
);
const NurseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z" />
    <path d="M20 21c0-3.3-3.6-6-8-6s-8 2.7-8 6" />
    <path d="M9.5 5h5M12 2.5v5" strokeLinecap="round" />
  </svg>
);
const PatientIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 8h4m-4 4h10m-10 4h6" strokeLinecap="round" />
  </svg>
);

const AdminDashboard = () => {
  const {
    doctors, fetchDoctors, isLoadingDoctors,
    nurses, fetchNurses, isLoadingNurses,
    patients, fetchPatients, isLoadingPatients,
  } = useAdminStore();

  useEffect(() => {
    fetchDoctors();
    fetchNurses();
    fetchPatients();
  }, [fetchDoctors, fetchNurses, fetchPatients]);

  const isLoading = isLoadingDoctors || isLoadingNurses || isLoadingPatients;

  const stats = [
    {
      label: "Total Doctors",
      value: isLoadingDoctors ? "…" : doctors.length,
      accent: "#0066cc",
      bg: "from-blue-50 to-white",
      icon: <DoctorIcon />,
    },
    {
      label: "Total Nurses",
      value: isLoadingNurses ? "…" : nurses.length,
      accent: "#059669",
      bg: "from-emerald-50 to-white",
      icon: <NurseIcon />,
    },
    {
      label: "Total Patients",
      value: isLoadingPatients ? "…" : patients.length,
      accent: "#d97706",
      bg: "from-amber-50 to-white",
      icon: <PatientIcon />,
    },
  ];

  /* ── Recent patients (newest 5) ── */
  const recentPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [patients]);

  /* ── Staff distribution ── */
  const totalStaff = doctors.length + nurses.length;
  const doctorPct = totalStaff ? Math.round((doctors.length / totalStaff) * 100) : 0;
  const nursePct = totalStaff ? 100 - doctorPct : 0;

  /* ── Gender breakdown ── */
  const genderStats = useMemo(() => {
    const m = patients.filter((p) => p.gender === "MALE").length;
    const f = patients.filter((p) => p.gender === "FEMALE").length;
    const o = patients.length - m - f;
    return { male: m, female: f, other: o, total: patients.length };
  }, [patients]);

  /* ── Donut ring helper (SVG) ── */
  const DonutRing = ({ segments, size = 120, strokeWidth = 14 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    return (
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f0f4f8" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const dash = (seg.pct / 100) * circumference;
          const el = (
            <circle
              key={i}
              cx={size/2} cy={size/2} r={radius}
              fill="none" stroke={seg.color} strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
    );
  };

  return (
    <>
      <style>{scrollbarCSS}</style>
      <h1 className="text-lg font-bold text-[#1a2b4a] mb-5 uppercase tracking-wide">
        Overview
      </h1>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`relative bg-gradient-to-br ${s.bg} border border-gray-200 rounded-lg p-5
              overflow-hidden cursor-default group
              transition-all duration-300 ease-out
              hover:shadow-lg hover:-translate-y-1 hover:border-gray-300`}
            style={{ borderLeft: `4px solid ${s.accent}` }}
          >
            {/* Background accent circle */}
            <div
              className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.07]
                group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-500"
              style={{ background: s.accent }}
            />
            <div className="flex items-start justify-between relative">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  {s.label}
                </div>
                <div
                  className="text-4xl font-extrabold transition-transform duration-300 group-hover:scale-105"
                  style={{ color: s.accent }}
                >
                  {s.value}
                </div>
              </div>
              <div
                className="p-2 rounded-lg opacity-60 group-hover:opacity-100 transition-all duration-300
                  group-hover:scale-110"
                style={{ color: s.accent, background: `${s.accent}10` }}
              >
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Grid: Recent Patients + Staff & Departments ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Patients — spans 2 cols */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl
          overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
          style={{ maxHeight: 360 }}>
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-[#e8eef6] to-white/60 shrink-0">
            <h2 className="text-xs font-bold text-[#1a2b4a] uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#0066cc] rounded-full inline-block" />
              Recent Patients
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : recentPatients.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No patients registered yet.
            </div>
          ) : (
            <div className="overflow-y-auto admin-scroll">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    <th className="text-left px-5 py-2 font-semibold">Name</th>
                    <th className="text-left px-5 py-2 font-semibold">Age</th>
                    <th className="text-left px-5 py-2 font-semibold">Gender</th>
                    <th className="text-left px-5 py-2 font-semibold">Doctor</th>
                    <th className="text-left px-5 py-2 font-semibold">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((p, i) => (
                    <tr
                      key={p._id}
                      className={`border-b border-gray-50 transition-colors duration-200 hover:bg-blue-50/40
                        ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`}
                    >
                      <td className="px-5 py-3 font-medium text-[#1a2b4a]">{p.name}</td>
                      <td className="px-5 py-3 text-gray-600">{p.age}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                          ${p.gender === "MALE"
                            ? "bg-blue-100 text-blue-700"
                            : p.gender === "FEMALE"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-gray-100 text-gray-600"}`}>
                          {p.gender}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {p.doctorId?.userId?.name || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column — Staff Distribution + Departments */}
        <div className="space-y-5">

          {/* Staff Distribution */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl overflow-hidden
            shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-[#e8eef6] to-white/60">
              <h2 className="text-xs font-bold text-[#1a2b4a] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#0066cc] rounded-full inline-block" />
                Staff Ratio
              </h2>
            </div>
            <div className="p-5">
              {isLoading ? (
                <div className="p-4 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : totalStaff === 0 ? (
                <div className="text-sm text-gray-400">No staff added yet.</div>
              ) : (
                <>
                  <div className="flex h-5 rounded-full overflow-hidden mb-4 shadow-inner bg-gray-100">
                    <div
                      className="bg-[#0066cc] transition-all duration-700 ease-out"
                      style={{ width: `${doctorPct}%` }}
                      title={`Doctors: ${doctorPct}%`}
                    />
                    <div
                      className="bg-[#7ca8d4] transition-all duration-700 ease-out"
                      style={{ width: `${nursePct}%` }}
                      title={`Nurses: ${nursePct}%`}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#0066cc]" />
                      <span className="text-gray-600">
                        Doctors <span className="font-bold text-[#1a2b4a]">{doctors.length}</span>
                        <span className="text-gray-400 ml-1">({doctorPct}%)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#7ca8d4]" />
                      <span className="text-gray-600">
                        Nurses <span className="font-bold text-[#1a2b4a]">{nurses.length}</span>
                        <span className="text-gray-400 ml-1">({nursePct}%)</span>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Gender Breakdown — fixed-size donut chart */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl overflow-hidden
            shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-[#e8eef6] to-white/60">
              <h2 className="text-xs font-bold text-[#1a2b4a] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#0066cc] rounded-full inline-block" />
                Patient Gender
              </h2>
            </div>
            <div className="p-5">
              {isLoading ? (
                <div className="p-4 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : genderStats.total === 0 ? (
                <div className="text-sm text-gray-400">No patients yet.</div>
              ) : (
                <div className="flex items-center gap-5">
                  {/* Donut */}
                  <div className="relative shrink-0">
                    <DonutRing
                      size={100}
                      strokeWidth={12}
                      segments={[
                        { pct: (genderStats.male / genderStats.total) * 100, color: "#0066cc" },
                        { pct: (genderStats.female / genderStats.total) * 100, color: "#c054a0" },
                        { pct: (genderStats.other / genderStats.total) * 100, color: "#94a3b8" },
                      ].filter(s => s.pct > 0)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-extrabold text-[#1a2b4a]">{genderStats.total}</span>
                    </div>
                  </div>
                  {/* Legend */}
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0066cc]" />
                      <span className="text-gray-600">Male</span>
                      <span className="font-bold text-[#1a2b4a] ml-auto">{genderStats.male}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c054a0]" />
                      <span className="text-gray-600">Female</span>
                      <span className="font-bold text-[#1a2b4a] ml-auto">{genderStats.female}</span>
                    </li>
                    {genderStats.other > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" />
                        <span className="text-gray-600">Other</span>
                        <span className="font-bold text-[#1a2b4a] ml-auto">{genderStats.other}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;