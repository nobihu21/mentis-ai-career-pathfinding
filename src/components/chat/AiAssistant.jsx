import { useEffect, useRef, useState } from "react";
import { aiApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { saveChatMessage, getChatHistory } from "../../services/firestore";

export default function AiAssistant() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Assalamu Alaikum! Main MENTIS hoon, aapka AI career advisor. Career path, skill gaps, ya roadmap ke baare mein kuch bhi poochein!" },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const bottomRef = useRef(null);

  // Load chat history from Firestore
  useEffect(() => {
    if (!user) return;
    getChatHistory(user.uid, 15).then((history) => {
      if (history.length > 0) {
        setMessages([
          { role: "assistant", content: "Assalamu Alaikum! Main MENTIS hoon. Aapki purani conversation bhi hai — aage poochhein!" },
          ...history.map((h) => ({ role: h.role, content: h.content })),
        ]);
      }
    });
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Save user message to Firestore
    if (user) await saveChatMessage(user.uid, "user", text);

    try {
      const context = [
        profile?.displayName ? `User: ${profile.displayName}` : "",
        profile?.topCareerMatch ? `Top career match: ${profile.topCareerMatch}` : "",
        profile?.readiness ? `Readiness score: ${profile.readiness}%` : "",
      ].filter(Boolean).join(". ");

      const data = await aiApi.chat(text, context);
      const aiMsg = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, aiMsg]);

      // Save AI reply to Firestore
      if (user) await saveChatMessage(user.uid, "assistant", data.response);
    } catch {
      setError("AI service se connect nahi ho saka. FastAPI server check karo (port 8000).");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-700 bg-mentisCard">
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-mentisText">AI Career Assistant</h2>
        <p className="text-xs text-mentisTextSecondary">
          GPT-4o Mini · {profile?.displayName || user?.email}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-mentisPrimary text-white"
                : "border border-slate-700 bg-mentisBg/70 text-mentisText"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-700 bg-mentisBg/70 px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-700 p-3">
        <div className="flex gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Career ke baare mein poochho…"
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-mentisBg px-3 py-2 text-sm text-mentisText placeholder-slate-500 focus:border-mentisPrimary focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-mentisPrimary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
