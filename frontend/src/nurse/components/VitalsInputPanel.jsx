import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

/* ── NEWS2 Risk Badge ── */
const RiskBadge = ({ riskLevel, score }) => {
  const styles = {
    HIGH:         "bg-red-100 text-red-700 border border-red-300",
    MEDIUM:       "bg-orange-100 text-orange-700 border border-orange-300",
    "LOW-MEDIUM": "bg-yellow-100 text-yellow-700 border border-yellow-300",
    LOW:          "bg-green-100 text-green-700 border border-green-300",
  };
  const icons = { HIGH: "🚨", MEDIUM: "⚠️", "LOW-MEDIUM": "🟡", LOW: "✅" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${styles[riskLevel] || styles.LOW}`}>
      {icons[riskLevel]} NEWS2: {score} — {riskLevel} RISK
    </span>
  );
};

const CONSCIOUSNESS_OPTIONS = [
  { value: "A", label: "A — Alert" },
  { value: "C", label: "C — New Confusion" },
  { value: "V", label: "V — Voice response" },
  { value: "P", label: "P — Pain response" },
  { value: "U", label: "U — Unresponsive" },
];

const VitalsInputPanel = ({ taskId, onSaved, onCancel }) => {
  const [vitals, setVitals] = useState({
    respiratoryRate: "",
    spO2: "",
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    temperature: "",
    consciousness: "A",
    onSupplementalO2: false,
  });
  const [preview, setPreview] = useState(null); // NEWS2 preview result
  const [submitting, setSubmitting] = useState(false);

  const setField = (field, value) => {
    setVitals((v) => ({ ...v, [field]: value }));
    setPreview(null); // Clear preview when user changes fields
  };

  /* ── Inline NEWS2 Preview (client-side calculation) ── */
  const computePreview = () => {
    // Simplified local calculation for instant feedback
    let score = 0;
    const v = vitals;
    const rr = Number(v.respiratoryRate);
    const o2 = Number(v.spO2);
    const sbp = Number(v.systolicBP);
    const hr = Number(v.heartRate);
    const temp = Number(v.temperature);

    if (v.respiratoryRate) {
      if (rr <= 8 || rr > 24) score += 3;
      else if (rr <= 11) score += 1;
      else if (rr <= 20) score += 0;
      else score += 2;
    }
    if (v.spO2) {
      if (o2 <= 91) score += 3;
      else if (o2 <= 93) score += 2;
      else if (o2 <= 95) score += 1;
    }
    if (v.onSupplementalO2) score += 2;
    if (v.systolicBP) {
      if (sbp <= 90) score += 3;
      else if (sbp <= 100) score += 2;
      else if (sbp <= 110) score += 1;
      else if (sbp > 219) score += 3;
    }
    if (v.heartRate) {
      if (hr <= 40 || hr > 130) score += 3;
      else if (hr <= 50 || (hr > 110 && hr <= 130)) score += 2;
      else if ((hr > 90 && hr <= 110) || (hr > 40 && hr <= 50)) score += 1;
    }
    if (v.temperature) {
      if (temp <= 35.0) score += 3;
      else if (temp <= 36.0) score += 1;
      else if (temp > 39.0) score += 2;
      else if (temp > 38.0) score += 1;
    }
    if (v.consciousness !== "A") score += 3;

    let riskLevel = "LOW";
    if (score >= 7) riskLevel = "HIGH";
    else if (score >= 5) riskLevel = "MEDIUM";
    else if (score >= 1) riskLevel = "LOW-MEDIUM";

    setPreview({ score, riskLevel });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check at least one vital is filled
    const hasData = Object.entries(vitals).some(([k, v]) => {
      if (k === "consciousness" || k === "onSupplementalO2") return false;
      return v !== "" && v !== null && v !== undefined;
    });
    if (!hasData) {
      toast.error("Please enter at least one vital sign.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/nurse/vitals/${taskId}`,
        { vitals },
        { withCredentials: true }
      );

      const { news2, autoFlagged } = data;
      toast.success(data.message, { duration: 5000 });
      if (autoFlagged) {
        toast.error("⚠️ Patient auto-flagged as URGENT due to high NEWS2 score!", { duration: 6000 });
      }
      onSaved(data.task, news2);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save vitals.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700">
        <strong>📊 Structured Vitals Entry</strong> — Fill in the values you've measured. The system will automatically calculate the <strong>NEWS2 Early Warning Score</strong>.
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Respiratory Rate */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Respiratory Rate <span className="text-gray-400 font-normal">(breaths/min)</span>
          </label>
          <input
            type="number" min="0" max="60" step="1"
            placeholder="e.g. 16"
            value={vitals.respiratoryRate}
            onChange={(e) => setField("respiratoryRate", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
        </div>

        {/* SpO2 */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            SpO₂ <span className="text-gray-400 font-normal">(%)</span>
          </label>
          <input
            type="number" min="50" max="100" step="1"
            placeholder="e.g. 97"
            value={vitals.spO2}
            onChange={(e) => setField("spO2", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
        </div>

        {/* Systolic BP */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Systolic BP <span className="text-gray-400 font-normal">(mmHg)</span>
          </label>
          <input
            type="number" min="0" max="300" step="1"
            placeholder="e.g. 120"
            value={vitals.systolicBP}
            onChange={(e) => setField("systolicBP", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
        </div>

        {/* Diastolic BP */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Diastolic BP <span className="text-gray-400 font-normal">(mmHg)</span>
          </label>
          <input
            type="number" min="0" max="200" step="1"
            placeholder="e.g. 80"
            value={vitals.diastolicBP}
            onChange={(e) => setField("diastolicBP", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
        </div>

        {/* Heart Rate */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Heart Rate <span className="text-gray-400 font-normal">(bpm)</span>
          </label>
          <input
            type="number" min="0" max="300" step="1"
            placeholder="e.g. 75"
            value={vitals.heartRate}
            onChange={(e) => setField("heartRate", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Temperature <span className="text-gray-400 font-normal">(°C)</span>
          </label>
          <input
            type="number" min="30" max="45" step="0.1"
            placeholder="e.g. 37.2"
            value={vitals.temperature}
            onChange={(e) => setField("temperature", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
        </div>
      </div>

      {/* Consciousness */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Consciousness Level (ACVPU)</label>
        <select
          value={vitals.consciousness}
          onChange={(e) => setField("consciousness", e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
        >
          {CONSCIOUSNESS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Supplemental O2 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="supO2"
          checked={vitals.onSupplementalO2}
          onChange={(e) => setField("onSupplementalO2", e.target.checked)}
          className="w-4 h-4 accent-[#0066cc]"
        />
        <label htmlFor="supO2" className="text-sm text-gray-700">
          Patient is on supplemental oxygen
        </label>
      </div>

      {/* NEWS2 Preview */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={computePreview}
          className="text-xs text-[#0066cc] underline font-medium hover:text-[#0055aa]"
        >
          Preview NEWS2 Score →
        </button>
        {preview && <RiskBadge riskLevel={preview.riskLevel} score={preview.score} />}
      </div>

      {/* Warning for high risk */}
      {preview && preview.score >= 5 && (
        <div className={`rounded-md p-3 text-xs font-medium ${
          preview.score >= 7
            ? "bg-red-50 border border-red-300 text-red-700"
            : "bg-orange-50 border border-orange-300 text-orange-700"
        }`}>
          {preview.score >= 7
            ? "🚨 HIGH RISK: Patient will be automatically flagged as URGENT. Notify the doctor immediately!"
            : "⚠️ MEDIUM RISK: Patient will be automatically flagged as URGENT. Monitor closely and notify doctor."}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm font-semibold rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2 text-sm font-semibold rounded-md bg-[#0066cc] text-white hover:bg-[#0055aa] transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Vitals & Calculate NEWS2"}
        </button>
      </div>
    </form>
  );
};

export { RiskBadge };
export default VitalsInputPanel;

