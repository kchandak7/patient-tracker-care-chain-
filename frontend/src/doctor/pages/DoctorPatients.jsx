import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDoctorStore } from "../../store/useDoctorStore";
import LoadingSpinner from "../../components/LoadingSpinner";
import { jsPDF } from "jspdf";

const DoctorPatients = () => {
  const { patients, fetchPatients, isLoadingPatients, fetchPrescription, updateDiagnosis } =
    useDoctorStore();

  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loadingRx, setLoadingRx] = useState(null);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null); // patientId
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [savingDiagnosis, setSavingDiagnosis] = useState(false);

  const startEditDiagnosis = (patient) => {
    setEditingDiagnosis(patient._id);
    setDiagnosisInput(patient.diagnosis || "");
  };

  const cancelEditDiagnosis = () => {
    setEditingDiagnosis(null);
    setDiagnosisInput("");
  };

  const saveDiagnosis = async (patientId) => {
    if (!diagnosisInput.trim()) {
      toast.error("Diagnosis cannot be empty");
      return;
    }
    try {
      setSavingDiagnosis(true);
      await updateDiagnosis(patientId, diagnosisInput.trim());
      toast.success("Diagnosis updated");
      setEditingDiagnosis(null);
      setDiagnosisInput("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update diagnosis");
    } finally {
      setSavingDiagnosis(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handlePrescription = async (patientId) => {
    try {
      setLoadingRx(patientId);
      const data = await fetchPrescription(patientId);
      setPrescriptionData(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load prescription");
    } finally {
      setLoadingRx(null);
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

  const downloadPrescriptionPDF = () => {
    if (!prescriptionData) return;
    const doc = new jsPDF();
    const p = prescriptionData.patient || {};
    const dr = prescriptionData.doctor || {};
    const tasks = prescriptionData.tasks || [];
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header bar
    doc.setFillColor(26, 43, 74); // #1a2b4a
    doc.rect(0, 0, pageW, 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PRESCRIPTION", 14, 16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dr. ${dr.name || "N/A"}`, 14, 26);
    doc.text(`Generated: ${new Date(prescriptionData.generatedAt).toLocaleString("en-IN")}`, 14, 32);
    y = 48;

    // Patient details section
    doc.setTextColor(26, 43, 74);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Details", 14, y);
    y += 2;
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(14, y, pageW - 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const details = [
      ["Name", p.name || "N/A"],
      ["Age", String(p.age ?? "N/A")],
      ["Gender", p.gender || "N/A"],
      ["Diagnosis", p.diagnosis || "N/A"],
    ];
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 120, 120);
      doc.text(`${label}:`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(26, 43, 74);
      doc.text(value, 50, y);
      y += 7;
    });

    y += 6;

    // Instructions section
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 43, 74);
    doc.text(`Instructions (${tasks.length})`, 14, y);
    y += 2;
    doc.setDrawColor(0, 102, 204);
    doc.line(14, y, pageW - 14, y);
    y += 8;

    if (tasks.length === 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(160, 160, 160);
      doc.text("No tasks/instructions recorded.", 14, y);
    } else {
      tasks.forEach((t, i) => {
        // Check if we need a new page
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(0, 102, 204);
        doc.circle(20, y - 1.5, 3.5, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(String(i + 1), 18.8, y);

        doc.setTextColor(26, 43, 74);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(t.description || "", pageW - 44);
        doc.text(lines, 28, y);
        y += lines.length * 5;

        if (t.time) {
          doc.setFontSize(8);
          doc.setTextColor(140, 140, 140);
          doc.text(
            new Date(t.time).toLocaleString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            }),
            28,
            y
          );
          y += 5;
        }
        y += 4;
      });
    }

    // Footer
    y = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(14, y, pageW - 14, y);
    y += 5;
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text("This is a computer-generated prescription.", 14, y);
    doc.text(`Doctor: ${dr.email || ""}`, pageW - 14, y, { align: "right" });

    doc.save(`Prescription_${(p.name || "Patient").replace(/\s+/g, "_")}.pdf`);
    toast.success("Prescription PDF downloaded");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-[#1a2b4a] uppercase">
          My Patients
        </h1>
        <span className="text-xs bg-blue-50 text-[#0066cc] border border-blue-200 px-3 py-1 rounded-md font-bold">
          {patients.length} Total
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f0f4f8] border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Age</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Gender</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Diagnosis</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Appointment</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
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
                <td colSpan="6" className="px-4 py-10 text-center text-sm text-gray-400">
                  No patients assigned to you yet.
                </td>
              </tr>
            )}

            {!isLoadingPatients &&
              patients.map((p) => (
                <tr key={p._id} className="border-t hover:bg-[#f8fafc] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1a2b4a]">
                    <div className="flex items-center gap-2">
                      {p.flagged && (
                        <span className="relative flex h-2.5 w-2.5 shrink-0" title="Flagged urgent by nurse">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                      )}
                      {p.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.age}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${p.gender === "MALE"
                        ? "bg-blue-100 text-blue-700"
                        : p.gender === "FEMALE"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-gray-100 text-gray-600"}`}>
                      {p.gender}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {editingDiagnosis === p._id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={diagnosisInput}
                          onChange={(e) => setDiagnosisInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveDiagnosis(p._id);
                            if (e.key === "Escape") cancelEditDiagnosis();
                          }}
                          autoFocus
                          className="border border-[#0066cc] rounded px-2 py-1 text-sm w-full
                            focus:outline-none focus:ring-1 focus:ring-[#0066cc] bg-white"
                          placeholder="Enter diagnosis…"
                        />
                        <button
                          onClick={() => saveDiagnosis(p._id)}
                          disabled={savingDiagnosis}
                          className="text-emerald-600 hover:text-emerald-700 p-1 shrink-0"
                          title="Save"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          onClick={cancelEditDiagnosis}
                          className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                          title="Cancel"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group/diag">
                        <span className={`truncate ${p.diagnosis ? "text-gray-600" : "text-gray-300 italic"}`}>
                          {p.diagnosis || "No diagnosis"}
                        </span>
                        <button
                          onClick={() => startEditDiagnosis(p)}
                          className="opacity-0 group-hover/diag:opacity-100 text-gray-400 hover:text-[#0066cc] p-0.5 transition-opacity shrink-0"
                          title="Edit diagnosis"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {fmtDate(p.appointmentTime?.date)} {p.appointmentTime?.time || ""}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handlePrescription(p._id)}
                      disabled={loadingRx === p._id}
                      className="text-xs font-bold text-[#0066cc] hover:text-[#0055aa]
                        disabled:opacity-40 uppercase tracking-wide transition-colors"
                    >
                      {loadingRx === p._id ? "Loading…" : "Prescription"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Prescription Modal */}
      {prescriptionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPrescriptionData(null)} />
          <div className="relative bg-white border border-gray-200 shadow-xl rounded-lg w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto admin-scroll">
            {/* Header */}
            <div className="bg-[#1a2b4a] text-white px-6 py-4 rounded-t-lg flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#0066cc] rounded-md flex items-center justify-center text-xs font-bold">
                  Rx
                </div>
                <div>
                  <div className="text-sm font-bold tracking-wide">PRESCRIPTION</div>
                  <div className="text-xs text-blue-300">{prescriptionData.patient?.name}</div>
                </div>
              </div>
              <button onClick={() => setPrescriptionData(null)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Patient Info */}
              <div className="bg-[#f0f4f8] rounded-md p-4 space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Patient Details</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="font-medium text-[#1a2b4a]">{prescriptionData.patient?.name}</span></div>
                  <div><span className="text-gray-500">Age:</span> <span className="font-medium">{prescriptionData.patient?.age}</span></div>
                  <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{prescriptionData.patient?.gender}</span></div>
                  <div><span className="text-gray-500">Diagnosis:</span> <span className="font-medium">{prescriptionData.patient?.diagnosis}</span></div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="text-xs text-gray-500">
                <span className="font-bold uppercase tracking-wider">Prescribed by:</span>{" "}
                <span className="text-[#1a2b4a] font-medium">Dr. {prescriptionData.doctor?.name}</span>
              </div>

              {/* Tasks / Instructions */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Instructions ({prescriptionData.tasks?.length || 0})
                </div>
                {prescriptionData.tasks?.length === 0 ? (
                  <div className="text-sm text-gray-400">No tasks/instructions recorded.</div>
                ) : (
                  <div className="space-y-2">
                    {prescriptionData.tasks?.map((t, i) => (
                      <div key={i} className="flex gap-3 bg-white border border-gray-100 rounded-md p-3">
                        <div className="w-6 h-6 rounded-full bg-[#0066cc] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-sm text-[#1a2b4a]">{t.description}</div>
                          {t.time && (
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(t.time).toLocaleString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-[10px] text-gray-400">
                  Generated: {new Date(prescriptionData.generatedAt).toLocaleString("en-IN")}
                </div>
                <button
                  onClick={downloadPrescriptionPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] hover:bg-[#0055aa]
                    text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors shadow-sm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-4 h-4">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorPatients;
