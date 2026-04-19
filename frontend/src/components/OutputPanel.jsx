import { useState, useEffect } from 'react';

const SEVERITY_CONFIG = {
  NORMAL:   { label: 'Normal',   class: 'badge-normal',   icon: '✅', pulse: 'bg-soc-green' },
  WARNING:  { label: 'Warning',  class: 'badge-warning',  icon: '⚠️', pulse: 'bg-soc-yellow' },
  CRITICAL: { label: 'Critical', class: 'badge-critical', icon: '🚨', pulse: 'bg-soc-red' },
};

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= text.length) { clearInterval(interval); return; }
      setDisplayed(text.slice(0, i + 1));
      i++;
    }, 8);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <pre className={`output-pre ${displayed.length < text?.length ? 'typing-cursor' : ''}`}>
      {displayed || ' '}
    </pre>
  );
}

export default function OutputPanel({ result, loading, error, elapsed }) {
  const [copied, setCopied] = useState(false);

  const severity = result?.severity || 'NORMAL';
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NORMAL;

  const handleCopy = () => {
    if (!result?.result) return;
    navigator.clipboard.writeText(result.result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-soc-cyan font-mono text-xs font-bold tracking-widest uppercase">
          &gt; Analysis Output
        </span>
        {elapsed != null && (
          <span className="font-mono text-[10px] text-soc-muted">
            ⏱ {elapsed.toLocaleString()} ms
          </span>
        )}
      </div>

      {/* Output box */}
      <div className="glass rounded-xl border border-soc-border flex-1 min-h-[280px] flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-soc-border/60 bg-black/20">
          {/* Status */}
          {loading ? (
            <div className="flex items-center gap-2 text-soc-cyan text-xs font-mono">
              <div className="spinner w-3.5 h-3.5" />
              <span className="animate-pulse">Running inference…</span>
            </div>
          ) : result ? (
            <div className="flex items-center gap-2">
              {/* Severity badge */}
              <span className={`${cfg.class} text-xs px-2.5 py-1 rounded-full font-mono font-bold
                               flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.pulse} animate-pulse-slow`} />
                {cfg.label}
              </span>
              {/* Mode tag */}
              <span className="text-[10px] font-mono text-soc-subtext capitalize border border-soc-border
                               px-2 py-0.5 rounded">
                {result.mode}
              </span>
            </div>
          ) : error ? (
            <span className="text-soc-red text-xs font-mono flex items-center gap-1.5">
              <span>❌</span> Error
            </span>
          ) : (
            <span className="text-soc-muted text-xs font-mono">Awaiting analysis…</span>
          )}

          {/* Copy button */}
          {result && (
            <button
              id="btn-copy-output"
              onClick={handleCopy}
              className="btn-secondary text-xs px-3 py-1 rounded-lg flex items-center gap-1.5"
            >
              {copied ? (
                <><span className="text-soc-green">✓</span> Copied</>
              ) : (
                <><span>📋</span> Copy</>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-4 animate-fade-in">
              <div className="spinner w-8 h-8" />
              <p className="font-mono text-xs text-soc-subtext">
                TinyLlama is processing your log…
              </p>
              {/* Fake progress shimmer */}
              <div className="w-48 h-1 rounded-full bg-soc-border overflow-hidden">
                <div className="h-full bg-gradient-to-r from-soc-cyan via-soc-green to-soc-cyan
                                rounded-full animate-shimmer"
                     style={{ animation: 'pulse 1.5s ease-in-out infinite', width: '60%' }} />
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="h-full flex flex-col items-center justify-center gap-3 animate-fade-in">
              <span className="text-4xl">⚠️</span>
              <p className="font-mono text-xs text-soc-red text-center max-w-sm">{error}</p>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="h-full flex flex-col items-center justify-center gap-3 opacity-30">
              <div className="text-5xl font-mono text-soc-green">&lt;/&gt;</div>
              <p className="font-mono text-xs text-soc-subtext">
                Output will appear here after analysis
              </p>
            </div>
          )}

          {!loading && !error && result && (
            <div className="animate-slide-up">
              <TypingText text={result.result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
