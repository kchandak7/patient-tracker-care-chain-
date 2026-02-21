import { useEffect, useState } from "react";
import { useNurseStore } from "../../store/useNurseStore";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import TypeBadge from "../components/TypeBadge";
import TaskUpdateModal from "../components/TaskUpdateModal";

const NurseTasks = () => {
  const { tasks, fetchTasks, isLoadingTasks, updateTask } = useNurseStore();
  const [filter, setFilter] = useState("ALL");
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filtered =
    filter === "ALL"
      ? tasks
      : tasks.filter((t) => t.status === filter);

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fmtTime = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusOptions = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#1a2b4a]">My Tasks</h2>
          <p className="text-xs text-gray-400">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
            {filter !== "ALL" && ` (${filter.replace("_", " ").toLowerCase()})`}
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 bg-[#f0f4f8] rounded-lg p-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filter === opt.value
                  ? "bg-[#0066cc] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#1a2b4a]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoadingTasks ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No tasks found.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8fafc]">
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">
                  Patient
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">
                  Type
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">
                  Description
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">
                  Status
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">
                  Timing
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">
                  Due
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">
                  Result
                </th>
                <th className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr
                  key={task._id}
                  className="border-b border-gray-50 hover:bg-[#f8fafc] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[#1a2b4a] whitespace-nowrap">
                    {task.patientId?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={task.taskType} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate">
                    {task.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {task.timingType === "SCHEDULED" ? (
                      <>
                        <span className="font-medium text-[#1a2b4a]">Scheduled</span>
                        <br />
                        {fmtDate(task.scheduledAt)} {fmtTime(task.scheduledAt)}
                      </>
                    ) : (
                      <span className="font-medium text-gray-400">Flexible</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {fmtDate(task.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate text-xs">
                    {task.resultValue || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {task.status !== "COMPLETED" ? (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0066cc] text-white hover:bg-[#0055aa] transition-colors"
                      >
                        Update
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-300 uppercase">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update modal */}
      {selectedTask && (
        <TaskUpdateModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
        />
      )}
    </>
  );
};

export default NurseTasks;
