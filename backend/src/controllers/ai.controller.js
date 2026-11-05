import getGeminiClient from "../lib/gemini.js";
import Nurse from "../models/Nurse.js";
import Patient from "../models/Patient.js";
import Task from "../models/Task.js";

// ─── NEWS2 Score Computation ─────────────────────────────────────────────────
/**
 * Calculate a simplified NEWS2 (National Early Warning Score 2).
 * Returns { score, riskLevel, breakdown }
 */
export function computeNEWS2(vitals) {
  const {
    respiratoryRate,
    spO2,
    systolicBP,
    heartRate,
    temperature,
    consciousness = "A", // A=Alert, C=Confusion, V=Voice, P=Pain, U=Unresponsive
    onSupplementalO2 = false,
  } = vitals;

  let score = 0;
  const breakdown = {};

  // Respiratory Rate (breaths/min)
  if (respiratoryRate !== undefined && respiratoryRate !== null && respiratoryRate !== "") {
    const rr = Number(respiratoryRate);
    if (rr <= 8)       { breakdown.respiratoryRate = 3; }
    else if (rr <= 11) { breakdown.respiratoryRate = 1; }
    else if (rr <= 20) { breakdown.respiratoryRate = 0; }
    else if (rr <= 24) { breakdown.respiratoryRate = 2; }
    else               { breakdown.respiratoryRate = 3; }
    score += breakdown.respiratoryRate;
  }

  // SpO2 (%)
  if (spO2 !== undefined && spO2 !== null && spO2 !== "") {
    const o2 = Number(spO2);
    if (o2 <= 91)       { breakdown.spO2 = 3; }
    else if (o2 <= 93)  { breakdown.spO2 = 2; }
    else if (o2 <= 95)  { breakdown.spO2 = 1; }
    else                { breakdown.spO2 = 0; }
    score += breakdown.spO2;
  }

  // Supplemental O2
  breakdown.onSupplementalO2 = onSupplementalO2 ? 2 : 0;
  score += breakdown.onSupplementalO2;

  // Systolic Blood Pressure (mmHg)
  if (systolicBP !== undefined && systolicBP !== null && systolicBP !== "") {
    const sbp = Number(systolicBP);
    if (sbp <= 90)        { breakdown.systolicBP = 3; }
    else if (sbp <= 100)  { breakdown.systolicBP = 2; }
    else if (sbp <= 110)  { breakdown.systolicBP = 1; }
    else if (sbp <= 219)  { breakdown.systolicBP = 0; }
    else                  { breakdown.systolicBP = 3; }
    score += breakdown.systolicBP;
  }

  // Heart Rate (bpm)
  if (heartRate !== undefined && heartRate !== null && heartRate !== "") {
    const hr = Number(heartRate);
    if (hr <= 40)        { breakdown.heartRate = 3; }
    else if (hr <= 50)   { breakdown.heartRate = 1; }
    else if (hr <= 90)   { breakdown.heartRate = 0; }
    else if (hr <= 110)  { breakdown.heartRate = 1; }
    else if (hr <= 130)  { breakdown.heartRate = 2; }
    else                 { breakdown.heartRate = 3; }
    score += breakdown.heartRate;
  }

  // Temperature (°C)
  if (temperature !== undefined && temperature !== null && temperature !== "") {
    const temp = Number(temperature);
    if (temp <= 35.0)       { breakdown.temperature = 3; }
    else if (temp <= 36.0)  { breakdown.temperature = 1; }
    else if (temp <= 38.0)  { breakdown.temperature = 0; }
    else if (temp <= 39.0)  { breakdown.temperature = 1; }
    else                    { breakdown.temperature = 2; }
    score += breakdown.temperature;
  }

  // Consciousness (ACVPU)
  const consciousnessScore = consciousness === "A" ? 0 : 3;
  breakdown.consciousness = consciousnessScore;
  score += consciousnessScore;

  // Risk Level
  let riskLevel = "LOW";
  let riskColor = "green";
  if (score >= 7) {
    riskLevel = "HIGH";
    riskColor = "red";
  } else if (score >= 5) {
    riskLevel = "MEDIUM";
    riskColor = "orange";
  } else if (score >= 1) {
    riskLevel = "LOW-MEDIUM";
    riskColor = "yellow";
  }

  return { score, riskLevel, riskColor, breakdown };
}

// ─── AI Nurse Assistant Chat ──────────────────────────────────────────────────
export const nurseAIChat = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ message: "User ID not found" });

    const nurse = await Nurse.findOne({ userId })
      .populate("userId", "name")
      .populate({ path: "doctorId", populate: { path: "userId", select: "name" } });
    if (!nurse) return res.status(404).json({ message: "Nurse not found" });

    const { message, patientId, conversationHistory = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Message is required" });

    // Optionally load patient context
    let patientContext = "";
    if (patientId) {
      const patient = await Patient.findById(patientId)
        .populate({ path: "doctorId", populate: { path: "userId", select: "name" } });
      if (patient) {
        const tasks = await Task.find({ patientId: patient._id, nurseId: nurse._id })
          .sort({ createdAt: -1 })
          .limit(10);

        const taskSummary = tasks
          .map(
            (t) =>
              `  - [${t.taskType}] ${t.description} | Status: ${t.status}${
                t.resultValue ? ` | Result: ${t.resultValue}` : ""
              }`
          )
          .join("\n");

        patientContext = `
ACTIVE PATIENT CONTEXT:
  Name: ${patient.name}
  Age: ${patient.age} years old
  Gender: ${patient.gender}
  Diagnosis: ${patient.diagnosis || "Not yet diagnosed"}
  Flagged as Urgent: ${patient.flagged ? "YES ⚠️" : "No"}
  Assigned Doctor: Dr. ${patient.doctorId?.userId?.name || "Unknown"}
  
Recent Tasks for this Patient:
${taskSummary || "  No recent tasks found."}
`;
      }
    }

    const systemPrompt = `You are an AI Nurse Assistant for MedCare Hospital, a helpful, knowledgeable, and compassionate clinical support tool.

You are assisting Nurse ${nurse.userId?.name || "Staff"}, who is supervised by Dr. ${
      nurse.doctorId?.userId?.name || "their assigned doctor"
    }.

YOUR CAPABILITIES:
1. Shift Handover Summaries – Generate concise, professional handover notes for the next shift nurse.
2. Drug & Dosage Guidance – Provide clinical guidance on medications, contraindications, dosing, and IV administration. Always remind the nurse to verify with the prescribing doctor for final decisions.
3. Vitals Interpretation – Explain what abnormal vitals mean, suggest monitoring frequency, and recommend whether to escalate to the doctor.
4. Clinical Task Assistance – Help structure task notes, interpret diagnostic test results, and suggest appropriate nursing interventions.
5. Patient Care Questions – Answer general nursing care questions using evidence-based guidelines.

${patientContext}

IMPORTANT GUIDELINES:
- Always maintain patient safety as the highest priority.
- For any critical situation (e.g., NEWS2 score ≥ 7, sudden deterioration), ALWAYS recommend immediate escalation to the doctor.
- Remind the nurse that you are an AI assistant — final clinical decisions must be made by qualified medical professionals.
- Be concise and practical. Nurses are busy — keep answers clear and actionable.
- Use bullet points and structured formatting when listing steps or information.
- For drug queries, include: dose range, common side effects, and key contraindications.`;

    const ai = getGeminiClient();

    // Build contents array from conversation history
    const contents = [];
    
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1024,
        temperature: 0.4,
      },
      contents,
    });

    const aiReply = response.text;

    res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.error("AI Nurse Chat error:", error);
    if (error.message?.includes("GEMINI_API_KEY")) {
      return res.status(503).json({ message: "AI service not configured. Please contact admin." });
    }
    res.status(500).json({ message: "AI service error. Please try again." });
  }
};

// ─── Vitals Submission with NEWS2 ────────────────────────────────────────────
export const submitVitalsWithNEWS2 = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ message: "User ID not found" });

    const nurse = await Nurse.findOne({ userId });
    if (!nurse) return res.status(404).json({ message: "Nurse not found" });

    const { taskId } = req.params;
    const { vitals } = req.body;

    if (!vitals || typeof vitals !== "object") {
      return res.status(400).json({ message: "Vitals data is required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (String(task.nurseId) !== String(nurse._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Compute NEWS2 score
    const news2 = computeNEWS2(vitals);

    // Format result value as a readable string
    const vitalLines = [];
    if (vitals.respiratoryRate) vitalLines.push(`RR: ${vitals.respiratoryRate} br/min`);
    if (vitals.spO2)            vitalLines.push(`SpO2: ${vitals.spO2}%`);
    if (vitals.systolicBP)      vitalLines.push(`BP: ${vitals.systolicBP}/${vitals.diastolicBP || "??"} mmHg`);
    if (vitals.heartRate)       vitalLines.push(`HR: ${vitals.heartRate} bpm`);
    if (vitals.temperature)     vitalLines.push(`Temp: ${vitals.temperature}°C`);
    if (vitals.consciousness)   vitalLines.push(`Consciousness: ${vitals.consciousness}`);
    vitalLines.push(`NEWS2 Score: ${news2.score} (${news2.riskLevel} RISK)`);

    const resultValue = vitalLines.join(" | ");

    // Update task
    task.resultValue = resultValue;
    task.status = "COMPLETED";
    task.completedAt = new Date();

    // Store vitals and NEWS2 on task
    task.vitals = vitals;
    task.news2Score = news2.score;
    task.news2Risk = news2.riskLevel;

    await task.save();

    // Auto-flag patient if HIGH or MEDIUM risk
    if (news2.score >= 5) {
      await (await import("../models/Patient.js")).default.findByIdAndUpdate(
        task.patientId,
        { flagged: true }
      );
    }

    res.status(200).json({
      task,
      news2,
      autoFlagged: news2.score >= 5,
      message: `Vitals saved. NEWS2 Score: ${news2.score} — ${news2.riskLevel} RISK${news2.score >= 5 ? ". Patient auto-flagged as urgent!" : "."}`,
    });
  } catch (error) {
    console.error("Vitals/NEWS2 error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

