import { useEffect, useState } from "react";
import { useNurseStore } from "../../store/useNurseStore";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import TypeBadge from "../components/TypeBadge";
import TaskUpdateModal from "../components/TaskUpdateModal";

const NursePatients = () => {
  const {
    patients,
    fetchPatients,
    isLoadingPatients,
    fetchPatientTasks,
    updateTask,
    togglePatientFlag,
  } = useNurseStore();

  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [patientTasks, setPatientTasks] = useState([]);
  const [loadingPTasks, setLoadingPTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleToggleTasks = async (patientId) => {
    if (expandedPatientId === patientId) {
      setExpandedPatientId(null);
      setPatientTasks([]);
      return;
    }
    setExpandedPatientId(patientId);
    setLoadingPTasks(true);
    try {
      const tasks = await fetchPatientTasks(patientId);
      setPatientTasks(tasks || []);
    } catch {
      setPatientTasks([]);
    } finally {
      setLoadingPTasks(false);
    }
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#1a2b4a]">My Patients</h2>
        <p className="text-xs text-gray-400">
          {patients.length} patient{patients.length !== 1 ? "s" : ""} assigned
        </p>
      </div>

      {isLoadingPatients ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No patients assigned yet.
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((p) => (
            <div
              key={p._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Patient row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066cc] to-[#0088ff] text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {p.name?.charAt(0)?.toUpperCase() || "?"}
                </div>

                {/* Info columns */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      Name
                    </div>
                    <div className="font-semibold text-[#1a2b4a]">{p.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      Age/Gender
                    </div>
                    <div className="text-gray-600">
                      {p.age} / {p.gender}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      Diagnosis
                    </div>
                    <div className="text-gray-600 truncate">
                      {p.diagnosis || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      Doctor
                    </div>
                    <div className="text-gray-600 truncate">
                      {p.doctorId?.userId?.name
                        ? `Dr. ${p.doctorId.userId.name}`
                        : "—"}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Flag urgent button */}
                  <button
                    onClick={() => togglePatientFlag(p._id)}
                    title={p.flagged ? "Remove urgent flag" : "Flag as urgent"}
                    className={`relative p-2 rounded-md transition-all duration-200 ${
                      p.flagged
                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400"
                    }`}
                  >
                    {/* Flag icon */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill={p.flagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                    {/* Glowing dot when flagged */}
                    {p.flagged && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </button>

                  {/* View Tasks button */}
                  <button
                    onClick={() => handleToggleTasks(p._id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      expandedPatientId === p._id
                        ? "bg-gray-200 text-[#1a2b4a]"
                        : "bg-[#0066cc] text-white hover:bg-[#0055aa]"
                    }`}
                  >
                    {expandedPatientId === p._id ? "Hide Tasks" : "View Tasks"}
                  </button>
                </div>
              </div>

              {/* Expanded tasks section */}
              {expandedPatientId === p._id && (
                <div className="border-t border-gray-100 bg-[#fafbfc] px-5 py-4">
                  {loadingPTasks ? (
                    <div className="flex justify-center py-6">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : patientTasks.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      No tasks for this patient.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                              Type
                            </th>
                            <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                              Description
                            </th>
                            <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                              Status
                            </th>
                            <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                              Due
                            </th>
                            <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                              Result
                            </th>
                            <th className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientTasks.map((task) => (
                            <tr
                              key={task._id}
                              className="border-b border-gray-100 hover:bg-white/60 transition-colors"
                            >
                              <td className="px-3 py-2">
                                <TypeBadge type={task.taskType} />
                              </td>
                              <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate">
                                {task.description || "—"}
                              </td>
                              <td className="px-3 py-2">
                                <StatusBadge status={task.status} />
                              </td>
                              <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                                {fmtDate(task.dueDate)}
                              </td>
                              <td className="px-3 py-2 text-gray-600 text-xs max-w-[120px] truncate">
                                {task.resultValue || "—"}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {task.status !== "COMPLETED" ? (
                                  <button
                                    onClick={() => setSelectedTask(task)}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#0066cc] text-white hover:bg-[#0055aa] transition-colors"
                                  >
                                    Update
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-300 uppercase">
                                    Done
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Update modal */}
      {selectedTask && (
        <TaskUpdateModal
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            // Refresh the expanded patient's tasks
            if (expandedPatientId) handleToggleTasks(expandedPatientId);
          }}
          onUpdate={updateTask}
        />
      )}
    </>
  );
};

export default NursePatients;
