import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAdminStore } from "../../store/useAdminStore";
import CreatePatientModal from "../components/CreatePatientModal";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminPatients = () => {
  const { patients, fetchPatients, deletePatient, isLoadingPatients } =
    useAdminStore();

  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${name || "this patient"}? This will also delete all associated tasks. This action cannot be undone.`);
    if (!confirmed) return;
    try {
      setDeletingId(id);
      await deletePatient(id);
      toast.success("Patient deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete patient");
    } finally {
      setDeletingId(null);
    }
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-[#1a2b4a] uppercase">
          Patients
        </h1>

        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#0066cc] hover:bg-[#0055aa]
          text-white text-xs font-bold uppercase tracking-wide rounded-sm"
        >
          + Create Patient
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f0f4f8] border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Age
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Gender
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Assigned Doctor
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Appointment
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoadingPatients && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center">
                  <LoadingSpinner size="md" />
                </td>
              </tr>
            )}

            {!isLoadingPatients && patients.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-10 text-center text-sm text-gray-400"
                >
                  No patients found. Create a patient to get started.
                </td>
              </tr>
            )}

            {!isLoadingPatients &&
              patients.map((p) => (
                <tr key={p._id} className="border-t hover:bg-[#f8fafc]">
                  <td className="px-4 py-3 font-medium text-[#1a2b4a]">
                    {p.name}
                  </td>
                  <td className="px-4 py-3">{p.age}</td>
                  <td className="px-4 py-3">{p.gender}</td>
                  <td className="px-4 py-3">
                    {p.doctorId?.userId?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {fmtDate(p.appointmentTime?.date)}{" "}
                    {p.appointmentTime?.time || ""}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      disabled={deletingId === p._id}
                      className="text-xs font-bold text-red-500 hover:text-red-700
                        disabled:opacity-40 uppercase tracking-wide"
                    >
                      {deletingId === p._id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <CreatePatientModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
};

export default AdminPatients;