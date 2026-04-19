import { useState, useCallback } from 'react';
import LogInputPanel  from './components/LogInputPanel';
import ModeSelector   from './components/ModeSelector';
import OutputPanel    from './components/OutputPanel';
import LogHistoryTable from './components/LogHistoryTable';
import StatsBar       from './components/StatsBar';

// Use relative URL in dev so Vite proxy forwards to http://localhost:8000
// In production, set VITE_API_URL env var to the backend host
const API_BASE = import.meta.env.VITE_API_URL || '';

const MAX_HISTORY = 10;

function formatTimestamp(date) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function App() {
  const [log,     setLog]     = useState('');
  const [mode,    setMode]    = useState('anomaly');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const [history, setHistory] = useState([]);
  const [stats,   setStats]   = useState({
    total: 0, anomalies: 0, normal: 0, totalMs: 0,
  });

  // Derived stat
  const avgMs = stats.total > 0 ? Math.round(stats.totalMs / stats.total) : 0;

  const handleLogChange = useCallback(({ log: newLog, suggestedMode }) => {
    setLog(newLog);
    if (suggestedMode) setMode(suggestedMode);
  }, []);

  const handleAnalyze = async () => {
    if (!log.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log: log.trim(), mode }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);

      // Update history (newest first, max 10)
      const entry = {
        id:        Date.now(),
        timestamp: formatTimestamp(new Date()),
        log:       log.trim(),
        mode,
        result:    data.result,
        severity:  data.severity,
      };
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));

      // Update stats
      setStats((prev) => ({
        total:    prev.total + 1,
        anomalies: prev.anomalies + (data.severity !== 'NORMAL' ? 1 : 0),
        normal:   prev.normal   + (data.severity === 'NORMAL'  ? 1 : 0),
        totalMs:  prev.totalMs  + data.elapsed_ms,
      }));

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scanline grid-bg min-h-screen flex flex-col">
      {/* ── Top nav ────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-soc-border/60 glass">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-soc-cyan to-soc-green
                            flex items-center justify-center text-black font-bold text-sm
                            shadow-glow-cyan">
              AI
            </div>
            <div>
              <div className="font-bold text-sm text-soc-text tracking-wide">SOC Log Analyzer</div>
              <div className="font-mono text-[10px] text-soc-subtext">TinyLlama-1.1B · LoRA</div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-soc-subtext
                            border border-soc-border rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-soc-green animate-pulse" />
              <span>Model Active</span>
            </div>
            <div className="font-mono text-[10px] text-soc-muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">

        {/* Stats bar */}
        <section className="mb-6">
          <StatsBar stats={{ total: stats.total, anomalies: stats.anomalies, normal: stats.normal, avgMs }} />
        </section>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Left column: Input + Mode + Run */}
          <div className="glass rounded-2xl border border-soc-border p-5 flex flex-col gap-5">
            {/* Log Input */}
            <LogInputPanel value={log} onChange={handleLogChange} disabled={loading} />

            {/* Mode selector */}
            <ModeSelector selected={mode} onSelect={setMode} disabled={loading} />

            {/* Run button */}
            <button
              id="btn-run-analysis"
              onClick={handleAnalyze}
              disabled={loading || !log.trim()}
              className="btn-primary w-full py-3 rounded-xl text-sm text-white font-bold
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Right column: Output */}
          <div className="glass rounded-2xl border border-soc-border p-5">
            <OutputPanel
              result={result}
              loading={loading}
              error={error}
              elapsed={result?.elapsed_ms ?? null}
            />
          </div>
        </div>

        {/* Log history table */}
        <section>
          <LogHistoryTable history={history} />
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="border-t border-soc-border/40 py-3">
        <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between">
          <span className="font-mono text-[10px] text-soc-muted">
            SOC Log Analyzer · TinyLlama-1.1B-Chat + LoRA
          </span>
          <span className="font-mono text-[10px] text-soc-muted">
            Session logs are not persisted
          </span>
        </div>
      </footer>
    </div>
  );
}
