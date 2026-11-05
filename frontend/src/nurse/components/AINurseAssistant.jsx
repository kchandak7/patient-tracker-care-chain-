import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNurseStore } from "../../store/useNurseStore";

/* ── Icons ── */
const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M12 2v4M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
    <circle cx="9" cy="16" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" strokeLinecap="round" />
  </svg>
);

/* ── Quick prompt buttons ── */
const QUICK_PROMPTS = [
  { label: "📋 Shift Handover", text: "Generate a professional shift handover summary for the next nurse." },
  { label: "💊 Drug Safety", text: "What are the key contraindications and nursing considerations for this patient's medications?" },
  { label: "📊 Vitals Advice", text: "Based on this patient's condition, what vitals should I monitor most closely and how often?" },
  { label: "🚨 Urgent Steps", text: "The patient looks unwell. What are the immediate nursing steps I should take?" },
];

/* ── Markdown-ish renderer (bold, bullets) ── */
const renderMarkdown = (text) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((p, j) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={j} className="font-semibold text-[#1a2b4a]">{p.slice(2, -2)}</strong>
        : p
    );
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return <li key={i} className="ml-3 list-disc">{formatted.slice(1)}</li>;
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <p key={i}>{formatted}</p>;
  });
};

const AINurseAssistant = ({ activePatientId = null, activePatientName = "" }) => {
  const { patients } = useNurseStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your AI Nurse Assistant. I can help with shift handovers, drug safety, vitals interpretation, and clinical guidance.\n\nSelect a patient below (or ask me anything!)",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(activePatientId || "");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Update selected patient when prop changes
  useEffect(() => {
    if (activePatientId) setSelectedPatientId(activePatientId);
  }, [activePatientId]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const userMsg = { role: "user", content: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    // Build history (exclude the first system greeting for API, keep user/assistant turns)
    const history = updatedMessages
      .slice(0, -1) // exclude the new user message (sent as `message`)
      .filter((m) => m.role === "user" || m.role === "assistant");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/nurse/chat`,
        {
          message: userText,
          patientId: selectedPatientId || null,
          conversationHistory: history,
        },
        { withCredentials: true }
      );
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "👋 Chat cleared! How can I assist you?",
      },
    ]);
  };

  const selectedPatient = patients?.find((p) => p._id === selectedPatientId);

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open ? "bg-[#dc2626] hover:bg-red-700" : "bg-[#0066cc] hover:bg-[#0055aa]"
        } text-white`}
        title="AI Nurse Assistant"
      >
        {open ? <CloseIcon /> : <BotIcon />}
        {/* Pulse when closed */}
        {!open && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400" />
          </span>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] flex flex-col bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          style={{ height: "520px" }}>

          {/* Header */}
          <div className="bg-[#1a2b4a] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0066cc] flex items-center justify-center">
                <BotIcon />
              </div>
              <div>
                <div className="text-sm font-bold tracking-wide">AI Nurse Assistant</div>
                <div className="text-[10px] text-blue-300 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                  Powered by Gemini · Free
                </div>
              </div>
            </div>
            <button onClick={clearChat} title="Clear chat" className="text-gray-400 hover:text-white transition-colors p-1">
              <ClearIcon />
            </button>
          </div>

          {/* Patient Context Selector */}
          <div className="px-3 py-2 bg-[#f0f4f8] border-b border-gray-200 shrink-0">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Patient Context (optional)
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-[#1a2b4a] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
            >
              <option value="">— No patient selected (general questions) —</option>
              {patients?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} · {p.age}y · {p.diagnosis || "No diagnosis"}
                </option>
              ))}
            </select>
            {selectedPatient && (
              <p className="text-[10px] text-[#0066cc] mt-1">
                ✓ AI will use {selectedPatient.name}'s data as context
              </p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 admin-scroll">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[#0066cc] text-white flex items-center justify-center shrink-0 mr-2 mt-0.5 text-xs">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[88%] text-xs rounded-xl px-3 py-2 leading-relaxed space-y-0.5 ${
                    msg.role === "user"
                      ? "bg-[#0066cc] text-white rounded-br-sm"
                      : "bg-[#f0f4f8] text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#0066cc] text-white flex items-center justify-center shrink-0 mr-2 mt-0.5 text-xs">AI</div>
                <div className="bg-[#f0f4f8] rounded-xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 pt-2 pb-1 border-t border-gray-100 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.text)}
                  disabled={loading}
                  className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-md bg-[#f0f4f8] text-[#1a2b4a] hover:bg-[#e0e8f0] transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about patient care..."
                disabled={loading}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0066cc] disabled:bg-gray-50 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-[#0066cc] text-white flex items-center justify-center hover:bg-[#0055aa] transition-colors disabled:opacity-40 shrink-0"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AINurseAssistant;

