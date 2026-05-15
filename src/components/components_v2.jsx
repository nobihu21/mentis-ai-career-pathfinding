// ===== RealTimeInterestHeatmap.jsx =====
export function RealTimeInterestHeatmap({ domains }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <div className="space-y-4">
        {Object.entries(domains || {}).sort((a, b) => b[1].score - a[1].score).map(([domain, data]) => (
          <div key={domain}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white capitalize">{domain}</span>
              <span className="text-sm font-semibold text-mentisPrimary">{Math.round(data.score)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mentisPrimary to-mentisSecondary transition-all duration-300"
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== ParentInterestHeatmap.jsx =====
export function ParentInterestHeatmap({ childId }) {
  const [domains, setDomains] = React.useState({});

  React.useEffect(() => {
    // Fetch real-time from API
    getChildInterestHeatmap(childId).then(data => setDomains(data.domains));
  }, [childId]);

  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Interest Strengths</h3>
      <div className="space-y-4">
        {Object.entries(domains).sort((a, b) => b[1] - a[1]).map(([domain, score]) => (
          <div key={domain}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-white capitalize">{domain}</span>
              <span className="text-sm font-semibold text-mentisPrimary">{score}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== CareerForecastCard.jsx =====
export function CareerForecastCard({ childId, rank }) {
  const [career, setCareer] = React.useState(null);

  React.useEffect(() => {
    getChildCareerForecast(childId).then(data => {
      if (data.topCareers && data.topCareers[rank - 1]) {
        setCareer(data.topCareers[rank - 1]);
      }
    });
  }, [childId, rank]);

  if (!career) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-400">#{rank} Recommended</p>
          <h4 className="text-xl font-semibold text-white mt-1">{career.careerName}</h4>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400">
          {career.suitabilityScore}% fit
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-400">Salary Range</p>
          <p className="text-sm font-medium text-white mt-1">{career.marketData?.avgSalary}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Market Growth</p>
          <p className="text-sm font-medium text-white mt-1">{career.marketData?.jobGrowth}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Time to Readiness</p>
          <p className="text-sm font-medium text-white mt-1">{career.timeToReadiness}</p>
        </div>
      </div>

      {career.skillGaps?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Skill Gaps</p>
          <ul className="space-y-1">
            {career.skillGaps.slice(0, 2).map((gap, i) => (
              <li key={i} className="text-xs text-slate-300">⚠️ {gap}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ===== StudentAiChat.jsx =====
export function StudentAiChat({ careerGoal, tier, interests }) {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: input }]);
    
    try {
      const response = await chatWithAiMentor(input, careerGoal, tier);
      setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (err) {
      console.error("Chat error:", err);
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
          <p className="text-slate-400 text-center py-8">Start a conversation about your career goals...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.role === "user" 
                ? "bg-mentisPrimary text-white" 
                : "bg-slate-700 text-slate-100"
            }`}>
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
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
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

// ===== ParentAiChat.jsx =====
export function ParentAiChat({ childId }) {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: input }]);
    
    try {
      const response = await chatWithParentAi(input, childId);
      setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Ask the AI Assistant</h3>
      <p className="text-sm text-slate-400 mb-4">Get personalized guidance on supporting your child's career journey</p>
      
      <div className="h-64 overflow-y-auto bg-slate-900 rounded-lg p-4 mb-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-slate-400 text-center py-8">Ask about your child's progress, careers, or how to support...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.role === "user" 
                ? "bg-mentisPrimary text-white" 
                : "bg-slate-700 text-slate-100"
            }`}>
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
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything about career preparation..."
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

// ===== StudentRoster.jsx =====
export function StudentRoster({ batchId, counselorId }) {
  const [students, setStudents] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState({});

  React.useEffect(() => {
    getBatchStudents(batchId, { ...filters, page }).then(data => {
      setStudents(data.students);
    });
  }, [batchId, filters, page]);

  return (
    <div className="rounded-xl border border-slate-700 bg-mentisCard p-6">
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <select
          onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
          className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm"
        >
          <option value="">All Tiers</option>
          <option value="matric">Matric</option>
          <option value="intermediate">Intermediate</option>
          <option value="degree">Degree</option>
        </select>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div key={student.studentId} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-white">{student.name}</h4>
                <p className="text-xs text-slate-400">{student.tier}</p>
              </div>
              {student.riskFlag && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                  {student.riskFlag.severity.toUpperCase()}
                </span>
              )}
            </div>

            <div className="mb-3">
              <p className="text-xs text-slate-400 mb-1">Interests</p>
              <div className="flex flex-wrap gap-1">
                {student.interests.slice(0, 2).map((interest) => (
                  <span key={interest} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-300">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-lg font-bold text-mentisPrimary mb-3">{student.readiness}%</p>

            <div className="flex gap-2">
              <button className="flex-1 px-2 py-1 text-xs rounded bg-slate-700 text-white hover:bg-slate-600">
                📧
              </button>
              <button className="flex-1 px-2 py-1 text-xs rounded bg-slate-700 text-white hover:bg-slate-600">
                🚩
              </button>
              <button className="flex-1 px-2 py-1 text-xs rounded bg-slate-700 text-white hover:bg-slate-600">
                →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 rounded bg-slate-700">Prev</button>
        <span className="px-4 py-2 text-white">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded bg-slate-700">Next</button>
      </div>
    </div>
  );
}
