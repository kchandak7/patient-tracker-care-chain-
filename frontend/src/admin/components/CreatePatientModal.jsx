import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAdminStore } from "../../store/useAdminStore";

const CreatePatientModal = ({ open, onClose }) => {
  const { createPatient, fetchPatients, doctors, fetchDoctors } =
    useAdminStore();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    doctorId: "",
    date: "",
    time: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open && doctors.length === 0) fetchDoctors();
  }, [open, doctors.length, fetchDoctors]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await createPatient({
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        doctorId: form.doctorId,
        appointmentTime: { date: form.date, time: form.time },
      });
      setSuccess(true);
      toast.success("Patient created successfully");
      await fetchPatients();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create patient";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: "",
      age: "",
      gender: "",
      doctorId: "",
      date: "",
      time: "",
    });
    setError("");
    setSuccess(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <div className="relative bg-white border border-gray-200 shadow-lg rounded-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#1a2b4a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-500 rounded-sm flex items-center justify-center text-xs font-bold">
              +
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">
                CREATE PATIENT
              </div>
              <div className="text-xs text-blue-300">
                Register a new patient
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

        <div className="p-6">
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-sm p-4 text-center">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wider">
                  ✓ Patient Created Successfully
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Patient Name
                </label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                    focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
                />
              </div>

              {/* Age + Gender row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    name="age"
                    type="number"
                    min="1"
                    required
                    value={form.age}
                    onChange={handleChange}
                    placeholder="30"
                    className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                      focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    required
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                      focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
                  >
                    <option value="">Select…</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Assigned Doctor
                </label>
                <select
                  name="doctorId"
                  required
                  value={form.doctorId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                    focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
                >
                  <option value="">Select a doctor…</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.userId?.name} — {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Appointment Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Appointment Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    value={form.date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                      focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Appointment Time
                  </label>
                  <input
                    name="time"
                    type="time"
                    required
                    value={form.time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                      focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600
                    text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#0066cc] hover:bg-[#0055aa]
                    disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
                >
                  {isSubmitting ? "Creating…" : "Create Patient"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePatientModal;
