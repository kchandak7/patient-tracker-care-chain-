import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDoctorStore } from "../../store/useDoctorStore";
import LoadingSpinner from "../../components/LoadingSpinner";

/* ── Create Task Modal ── */
const CreateTaskModal = ({ open, onClose, patients, nurses }) => {
  const { createTask } = useDoctorStore();

  const [form, setForm] = useState({
    patientId: "",
    nurseId: "",
    taskType: "",
    description: "",
    timingType: "FLEXIBLE",
    scheduledAt: "",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        patientId: form.patientId,
        nurseId: form.nurseId,
        taskType: form.taskType,
        description: form.description,
        timingType: form.timingType,
      };
      if (form.timingType === "SCHEDULED" && form.scheduledAt)
        payload.scheduledAt = form.scheduledAt;
      if (form.timingType === "FLEXIBLE" && form.dueDate)
        payload.dueDate = form.dueDate;

      await createTask(payload);
      toast.success("Task created successfully");
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      patientId: "",
      nurseId: "",
      taskType: "",
      description: "",
      timingType: "FLEXIBLE",
      scheduledAt: "",
      dueDate: "",
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white border border-gray-200 shadow-xl rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto admin-scroll">
        {/* Header */}
        <div className="bg-[#1a2b4a] text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#0066cc] rounded-md flex items-center justify-center text-xs font-bold">+</div>
            <div>
              <div className="text-sm font-bold tracking-wide">CREATE TASK</div>
              <div className="text-xs text-blue-300">Assign a task to a nurse</div>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Patient
            </label>
            <select
              name="patientId"
              required
              value={form.patientId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm
                focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
            >
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — {p.diagnosis}
                </option>
              ))}
            </select>
          </div>

          {/* Nurse */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Assign to Nurse
            </label>
            <select
              name="nurseId"
              required
              value={form.nurseId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm
                focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
            >
              <option value="">Select nurse…</option>
              {nurses.map((n) => (
                <option key={n._id} value={n._id}>
                  {n.userId?.name || n.userId?.email}
                </option>
              ))}
            </select>
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Task Type
            </label>
            <select
              name="taskType"
              required
              value={form.taskType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm
                focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
            >
              <option value="">Select type…</option>
              <option value="MEDICATION">Medication</option>
              <option value="TEST">Test</option>
              <option value="VITALS">Vitals</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              name="description"
              required
              value={form.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe the task…"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm resize-none
                focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
            />
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Timing
              </label>
              <select
                name="timingType"
                value={form.timingType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm
                  focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
              >
                <option value="FLEXIBLE">Flexible</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>
            <div>
              {form.timingType === "SCHEDULED" ? (
                <>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Scheduled At
                  </label>
                  <input
                    name="scheduledAt"
                    type="datetime-local"
                    required
                    value={form.scheduledAt}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm
                      focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
                  />
                </>
              ) : (
                <>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Due Date (opt.)
                  </label>
                  <input
                    name="dueDate"
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm
                      focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
                  />
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-600
                text-xs font-bold uppercase tracking-widest rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-[#0066cc] hover:bg-[#0055aa]
                disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded-md transition-colors"
            >
              {isSubmitting ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Status badge component ── */
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
  };
  const label = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {label[status] || status}
    </span>
  );
};

/* ── Task Type badge ── */
const TypeBadge = ({ type }) => {
  const styles = {
    MEDICATION: "bg-purple-100 text-purple-700",
    TEST: "bg-cyan-100 text-cyan-700",
    VITALS: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[type] || "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  );
};

const DoctorTasks = () => {
  const {
    tasks, fetchTasks, isLoadingTasks,
    patients, fetchPatients, isLoadingPatients,
    nurses, fetchNurses, isLoadingNurses,
  } = useDoctorStore();

  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchTasks();
    fetchPatients();
    fetchNurses();
  }, [fetchTasks, fetchPatients, fetchNurses]);

  const filteredTasks = filterStatus === "ALL"
    ? tasks
    : tasks.filter(t => t.status === filterStatus);

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short",
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-[#1a2b4a] uppercase">Tasks</h1>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-xs font-semibold
              focus:outline-none focus:border-[#0066cc] bg-white"
          >
            <option value="ALL">All ({tasks.length})</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#0066cc] hover:bg-[#0055aa]
              text-white text-xs font-bold uppercase tracking-wide rounded-md transition-colors"
          >
            + Create Task
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f0f4f8] border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nurse</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Timing</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Result</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingTasks && (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center">
                  <LoadingSpinner size="md" />
                </td>
              </tr>
            )}

            {!isLoadingTasks && filteredTasks.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center text-sm text-gray-400">
                  {filterStatus === "ALL"
                    ? "No tasks created yet. Create a task to get started."
                    : `No ${filterStatus.toLowerCase().replace("_", " ")} tasks.`}
                </td>
              </tr>
            )}

            {!isLoadingTasks &&
              filteredTasks.map((t) => (
                <tr key={t._id} className="border-t hover:bg-[#f8fafc] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1a2b4a]">
                    {t.patientId?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={t.taskType} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={t.description}>
                    {t.description}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {t.nurseId?.userId?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <div>{t.timingType}</div>
                    <div className="text-gray-400">
                      {t.timingType === "SCHEDULED"
                        ? fmtDate(t.scheduledAt)
                        : t.dueDate ? `Due: ${fmtDate(t.dueDate)}` : "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {t.resultValue || "—"}
                    {t.image && (
                      <a href={t.image} target="_blank" rel="noopener noreferrer"
                        className="ml-1 text-[#0066cc] hover:underline">
                        📷
                      </a>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <CreateTaskModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        patients={patients}
        nurses={nurses}
      />
    </>
  );
};

export default DoctorTasks;
