import { useState } from "react";
import toast from "react-hot-toast";
import StatusBadge from "./StatusBadge";
import TypeBadge from "./TypeBadge";
import { useNurseStore } from "../../store/useNurseStore";

const TaskUpdateModal = ({ task, onClose }) => {
  const { updateTask } = useNurseStore();

  const [status, setStatus] = useState(task.status || "PENDING");
  const [resultValue, setResultValue] = useState(task.resultValue || "");
  const [imagePreview, setImagePreview] = useState(task.image || null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { status };
      if (resultValue.trim()) payload.resultValue = resultValue.trim();
      if (imageBase64) payload.image = imageBase64;

      await updateTask(task._id, payload);
      toast.success("Task updated successfully");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white border border-gray-200 shadow-xl rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto admin-scroll">

        {/* Header */}
        <div className="bg-[#1a2b4a] text-white px-6 py-4 rounded-t-lg flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#0066cc] rounded-md flex items-center justify-center text-xs font-bold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">UPDATE TASK</div>
              <div className="text-xs text-blue-300">{task.patientId?.name || "Patient"}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Task Info (read-only) */}
          <div className="bg-[#f0f4f8] rounded-md p-4 space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Task Details</div>
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={task.taskType} />
              <StatusBadge status={task.status} />
              <span className="text-xs text-gray-400">
                {task.timingType === "SCHEDULED" ? `Scheduled: ${fmtDate(task.scheduledAt)}` : `Due: ${fmtDate(task.dueDate)}`}
              </span>
            </div>
            <div className="text-sm text-[#1a2b4a] mt-1">{task.description}</div>
            {task.doctorId?.userId?.name && (
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-semibold">Assigned by:</span> Dr. {task.doctorId.userId.name}
              </div>
            )}
          </div>

          {/* Status Update */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="flex gap-2">
              {["PENDING", "IN_PROGRESS", "COMPLETED"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-md border transition-all
                    ${status === s
                      ? s === "PENDING"
                        ? "bg-amber-100 text-amber-700 border-amber-300"
                        : s === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-emerald-100 text-emerald-700 border-emerald-300"
                      : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {s === "IN_PROGRESS" ? "IN PROGRESS" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Result Value */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Result / Notes
            </label>
            <textarea
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value)}
              rows="3"
              placeholder="Enter test result, vitals reading, medication notes…"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc] resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Attach Image (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-[#0066cc] transition-colors">
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-md object-contain" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    className="text-xs text-red-500 hover:text-red-600 font-semibold"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    className="w-8 h-8 mx-auto text-gray-300 mb-2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span className="text-xs text-gray-400">Click to upload (max 5 MB)</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
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
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskUpdateModal;
