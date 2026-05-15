import React from "react";
import { chatWithCounselorAi } from "../../services/api";

export default function CounselorAiAssistant() {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const data = await chatWithCounselorAi(text);
      setMessages((prev) => [...prev, { role: "assistant", content: data?.response || "No response." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "AI service is not available right now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <h3 className="text-lg font-semibold text-white mb-4">AI Batch Assistant</h3>
      <div className="h-72 overflow-y-auto rounded-lg bg-mentisBg p-3">
        {messages.length === 0 && <p className="text-sm text-slate-400">Ask about at-risk students, skill gaps, or intervention strategies.</p>}
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "ml-auto bg-mentisPrimary text-white" : "bg-slate-700 text-slate-100"}`}>
            {message.content}
          </div>
        ))}
        {loading && <p className="text-sm text-slate-400">Thinking...</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-white" placeholder="Which students need help?" />
        <button onClick={send} disabled={loading} className="rounded-lg bg-mentisPrimary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Send</button>
      </div>
    </div>
  );
}

