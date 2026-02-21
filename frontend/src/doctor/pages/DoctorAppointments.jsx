import { useEffect } from "react";
import { useDoctorStore } from "../../store/useDoctorStore";
import LoadingSpinner from "../../components/LoadingSpinner";

const DoctorAppointments = () => {
  const { appointments, fetchAppointments, isLoadingAppointments } =
    useDoctorStore();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-[#1a2b4a] uppercase">
            Today's Appointments
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">{today}</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-md font-bold">
          {appointments.length} Scheduled
        </span>
      </div>

      {isLoadingAppointments ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            className="w-14 h-14 mx-auto text-gray-300 mb-4">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <div className="text-sm font-semibold text-gray-500 mb-1">No appointments today</div>
          <div className="text-xs text-gray-400">Patients scheduled for today will appear here.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((p) => (
            <div
              key={p._id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm
                hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              style={{ borderLeft: "4px solid #059669" }}
            >
              {/* Patient name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-[#1a2b4a] group-hover:text-[#0066cc] transition-colors">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {p.age} yrs • {p.gender}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                  ${p.gender === "MALE"
                    ? "bg-blue-100 text-blue-700"
                    : p.gender === "FEMALE"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-gray-100 text-gray-600"}`}>
                  {p.gender}
                </span>
              </div>

              {/* Diagnosis */}
              <div className="text-xs text-gray-500 mb-3">
                <span className="font-semibold uppercase tracking-wider text-gray-400">Diagnosis: </span>
                <span className="text-gray-700">{p.diagnosis}</span>
              </div>

              {/* Appointment Time */}
              <div className="flex items-center gap-2 bg-emerald-50 rounded-md px-3 py-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="w-4 h-4 text-emerald-600 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-sm font-bold text-emerald-700">
                  {p.appointmentTime?.time || "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DoctorAppointments;
