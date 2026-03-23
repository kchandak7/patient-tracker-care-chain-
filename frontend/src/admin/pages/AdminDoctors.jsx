import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAdminStore } from "../../store/useAdminStore";
import CreateDoctorModal from "../components/CreateDoctorModal";
import LoadingSpinner from "../../components/LoadingSpinner";

/* ── Reassign Modal ── */
const ReassignModal = ({ doctor, doctors, onConfirm, onCancel, isDeleting }) => {
  const [reassignTo, setReassignTo] = useState("");
  const otherDoctors = doctors.filter((d) => d._id !== doctor._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white border border-gray-200 shadow-xl rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-[#1a2b4a] text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-red-500 rounded-md flex items-center justify-center text-xs font-bold">
              !
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">REASSIGN &amp; DELETE</div>
              <div className="text-xs text-blue-300">Transfer staff before removing doctor</div>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white text-lg">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold">Dr. {doctor.userId?.name}</span> has nurses and/or patients assigned.
              Select another doctor to transfer them to before deleting.
            </p>
          </div>

          {/* Reassign selector */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Reassign to
            </label>
            {otherDoctors.length === 0 ? (
              <p className="text-xs text-red-500">No other doctors available. Create another doctor first.</p>
            ) : (
              <select
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm
                  focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] bg-[#fafbfc]"
              >
                <option value="">Select a doctor…</option>
                {otherDoctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.userId?.name} — {d.department}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 border border-gray-300 text-gray-600
                text-xs font-bold uppercase tracking-widest rounded-md
                hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(reassignTo)}
              disabled={!reassignTo || isDeleting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700
                disabled:opacity-40 text-white text-xs font-bold uppercase
                tracking-widest rounded-md transition-colors"
            >
              {isDeleting ? "Deleting…" : "Reassign & Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDoctors = () => {
  const { doctors, fetchDoctors, deleteDoctor, fetchNurses, fetchPatients, isLoadingDoctors } =
    useAdminStore();

  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [reassignDoctor, setReassignDoctor] = useState(null); // doctor object needing reassignment

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDelete = async (doc) => {
    const confirmed = window.confirm(`Are you sure you want to delete Dr. ${doc.userId?.name || "this doctor"}? This action cannot be undone.`);
    if (!confirmed) return;
    // First attempt without reassignment — backend will tell us if reassign is needed
    try {
      setDeletingId(doc.userId?._id);
      await deleteDoctor(doc.userId?._id);
      toast.success("Doctor deleted successfully");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.requiresReassign) {
        setReassignDoctor(doc);
      } else {
        toast.error(data?.message || "Failed to delete doctor");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleReassignConfirm = async (reassignTo) => {
    try {
      setDeletingId(reassignDoctor.userId?._id);
      await deleteDoctor(reassignDoctor.userId?._id, reassignTo);
      setReassignDoctor(null);
      toast.success("Doctor deleted & staff reassigned");
      fetchNurses();
      fetchPatients();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete doctor");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-[#1a2b4a] uppercase">
          Doctors
        </h1>

        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#0066cc] hover:bg-[#0055aa]
            text-white text-xs font-bold uppercase tracking-wide rounded-md transition-colors"
        >
          + Create Doctor
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f0f4f8] border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Specialization
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoadingDoctors && (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center">
                  <LoadingSpinner size="md" />
                </td>
              </tr>
            )}

            {!isLoadingDoctors && doctors.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-10 text-center text-sm text-gray-400"
                >
                  No doctors found. Create a doctor to get started.
                </td>
              </tr>
            )}

            {!isLoadingDoctors &&
              doctors.map((doc) => (
                <tr key={doc._id} className="border-t hover:bg-[#f8fafc] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1a2b4a]">
                    {doc.userId?.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {doc.userId?.email}
                  </td>
                  <td className="px-4 py-3">{doc.specialization}</td>
                  <td className="px-4 py-3">{doc.department}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.userId?._id}
                      className="text-xs font-bold text-red-500 hover:text-red-700
                        disabled:opacity-40 uppercase tracking-wide transition-colors"
                    >
                      {deletingId === doc.userId?._id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Create Doctor Modal */}
      <CreateDoctorModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {/* Reassign Modal */}
      {reassignDoctor && (
        <ReassignModal
          doctor={reassignDoctor}
          doctors={doctors}
          onConfirm={handleReassignConfirm}
          onCancel={() => setReassignDoctor(null)}
          isDeleting={!!deletingId}
        />
      )}
    </>
  );
};

export default AdminDoctors;