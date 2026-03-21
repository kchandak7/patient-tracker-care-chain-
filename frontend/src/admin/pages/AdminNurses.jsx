import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAdminStore } from "../../store/useAdminStore";
import CreateNurseModal from "../components/CreateNurseModal";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminNurses = () => {
  const { nurses, fetchNurses, deleteNurse, isLoadingNurses } = useAdminStore();

  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchNurses();
  }, [fetchNurses]);

  const handleDelete = async (userId, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${name || "this nurse"}? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      setDeletingId(userId);
      await deleteNurse(userId);
      toast.success("Nurse deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete nurse");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-[#1a2b4a] uppercase">
          Nurses
        </h1>

        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#0066cc] hover:bg-[#0055aa]
          text-white text-xs font-bold uppercase tracking-wide rounded-sm"
        >
          + Create Nurse
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
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Assigned Doctor
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Default Password
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoadingNurses && (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center">
                  <LoadingSpinner size="md" />
                </td>
              </tr>
            )}

            {!isLoadingNurses && nurses.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-10 text-center text-sm text-gray-400"
                >
                  No nurses found. Create a nurse to get started.
                </td>
              </tr>
            )}

            {!isLoadingNurses &&
              nurses.map((n) => (
                <tr key={n._id} className="border-t hover:bg-[#f8fafc]">
                  <td className="px-4 py-3 font-medium text-[#1a2b4a]">
                    {n.userId?.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {n.userId?.email}
                  </td>
                  <td className="px-4 py-3">
                    {n.doctorId?.userId?.name || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 bg-blue-50/50 rounded pointer-events-none select-all relative group cursor-text">
                    {/* The password format is name@suffix, extracted from nurse.name.suffix@hospital.com */}
                    {n.userId?.email?.split('@')[0].split('.').slice(1, 2)[0]}@{n.userId?.email?.split('@')[0].split('.').pop()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(n.userId?._id, n.userId?.name)}
                      disabled={deletingId === n.userId?._id}
                      className="text-xs font-bold text-red-500 hover:text-red-700
                        disabled:opacity-40 uppercase tracking-wide"
                    >
                      {deletingId === n.userId?._id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <CreateNurseModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
};

export default AdminNurses;