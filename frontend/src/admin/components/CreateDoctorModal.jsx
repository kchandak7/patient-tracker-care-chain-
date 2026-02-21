import { useState } from "react";
import toast from "react-hot-toast";
import { useAdminStore } from "../../store/useAdminStore";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* fallback: select-all is still available */ }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 ml-2 px-2 py-1 rounded text-xs font-semibold border transition-colors
        bg-[#f0f4f8] border-gray-300 text-gray-600 hover:bg-[#0066cc] hover:text-white hover:border-[#0066cc]"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Oncology",
  "Radiology",
  "Psychiatry",
  "General Surgery",
  "ENT",
  "Ophthalmology",
  "Gynecology",
  "Urology",
  "Anesthesiology",
  "Pathology",
];

const DEPARTMENTS = [
  "Internal Medicine",
  "Surgery",
  "Pediatrics",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Oncology",
  "Emergency Medicine",
  "Radiology",
  "Psychiatry",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Gynecology",
  "ICU",
];

const CreateDoctorModal = ({ open, onClose }) => {
  const { createDoctor, fetchDoctors } = useAdminStore();

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    department: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState(null); // { email, password }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await createDoctor(form);
      setCredentials(data.credentials);
      toast.success("Doctor created successfully");
      await fetchDoctors();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create doctor";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ name: "", specialization: "", department: "" });
    setError("");
    setCredentials(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white border border-gray-200 shadow-lg rounded-sm w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-[#1a2b4a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#0066cc] rounded-sm flex items-center justify-center text-xs font-bold">
              +
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">
                CREATE DOCTOR
              </div>
              <div className="text-xs text-blue-300">
                Add a new doctor to the system
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ── Success: show generated credentials ── */}
          {credentials ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-sm p-4">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                  ✓ Doctor Created Successfully
                </div>
                <p className="text-xs text-green-600 mb-3">
                  Share the following credentials with the doctor. The
                  password cannot be recovered after closing this dialog.
                </p>

                <div className="bg-white border border-green-200 rounded-sm p-3 space-y-3">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Email</div>
                    <div className="flex items-center">
                      <span className="font-mono text-sm text-[#1a2b4a] font-semibold select-all break-all leading-snug">
                        {credentials.email}
                      </span>
                      <CopyButton text={credentials.email} />
                    </div>
                  </div>
                  <div className="border-t border-green-100 pt-3">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Password</div>
                    <div className="flex items-center">
                      <span className="font-mono text-sm text-[#1a2b4a] font-semibold select-all break-all leading-snug">
                        {credentials.password}
                      </span>
                      <CopyButton text={credentials.password} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-[#1a2b4a] hover:bg-[#243a63] text-white
                  text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                    focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]
                    bg-[#fafbfc]"
                />
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Specialization
                </label>
                <select
                  name="specialization"
                  required
                  value={form.specialization}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                    focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]
                    bg-[#fafbfc]"
                >
                  <option value="">Select specialization…</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  name="department"
                  required
                  value={form.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                    focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]
                    bg-[#fafbfc]"
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600
                    text-xs font-bold uppercase tracking-widest rounded-sm
                    hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#0066cc] hover:bg-[#0055aa]
                    disabled:opacity-60 text-white text-xs font-bold uppercase
                    tracking-widest rounded-sm transition-colors"
                >
                  {isSubmitting ? "Creating…" : "Create Doctor"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateDoctorModal;
