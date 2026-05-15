import React from "react";
import { chatWithAiMentor } from "../../services/api";

export default function StudentAiChat({ careerGoal, tier }) {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const response = await chatWithAiMentor(text, careerGoal, tier);
      setMessages((prev) => [...prev, { role: "assistant", content: response?.response ?? response?.content ?? "" }]);
    } catch (err) {
      const fallback = `Based on your ${tier || "current"} profile, keep logging real activities first. Then choose one top career, identify one skill gap, and complete a small task this week.`;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallback },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Ask Your Mentor</h3>

      <div className="h-64 overflow-y-auto bg-slate-900 rounded-lg p-4 mb-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-slate-400 text-center py-8">
            Start a conversation about your career goals...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-mentisPrimary text-white"
                  : "bg-slate-700 text-slate-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-slate-400 text-sm italic">Thinking...</p>}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me about careers, skills, or next steps..."
          className="flex-1 px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:border-mentisPrimary outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-mentisPrimary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Send →
        </button>
      </div>
    </div>
  );
}

