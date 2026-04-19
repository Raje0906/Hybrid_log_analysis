import { useState, useRef } from 'react';
import { SAMPLE_LOGS } from '../constants';

export default function LogInputPanel({ value, onChange, disabled }) {
  const [showSamples, setShowSamples] = useState(false);
  const textareaRef = useRef(null);

  const handleSample = (sample) => {
    onChange({ log: sample.log, suggestedMode: sample.mode });
    setShowSamples(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleClear = () => {
    onChange({ log: '', suggestedMode: null });
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-soc-cyan font-mono text-xs font-bold tracking-widest uppercase">
            &gt; Log Input
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-soc-green animate-pulse-slow" />
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Load Sample Button */}
          <button
            id="btn-load-sample"
            onClick={() => setShowSamples((v) => !v)}
            disabled={disabled}
            className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <span>Load Sample</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showSamples ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {showSamples && (
            <div className="absolute right-0 top-full mt-1.5 z-50 w-60 glass rounded-xl overflow-hidden
                            border border-soc-border shadow-xl animate-fade-in">
              {SAMPLE_LOGS.map((s, i) => (
                <button
                  key={i}
                  id={`btn-sample-${i}`}
                  onClick={() => handleSample(s)}
                  className="w-full text-left px-4 py-3 hover:bg-soc-cyan/10 transition-colors
                             border-b border-soc-border/50 last:border-0"
                >
                  <div className="font-mono text-xs text-soc-text">{s.label}</div>
                  <div className="text-xs text-soc-subtext mt-0.5 capitalize">{s.mode}</div>
                </button>
              ))}
            </div>
          )}

          {/* Clear Button */}
          {value && (
            <button
              id="btn-clear-log"
              onClick={handleClear}
              disabled={disabled}
              className="btn-secondary text-xs px-3 py-1.5 rounded-lg text-soc-red border-soc-red/30
                         hover:bg-soc-red/10 hover:border-soc-red/60 hover:text-soc-red"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        {/* Line numbers overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-end pr-2 pt-3
                        text-soc-muted font-mono text-xs select-none pointer-events-none
                        border-r border-soc-border/40 overflow-hidden">
          {Array.from({ length: Math.max(value.split('\n').length, 15) }, (_, i) => (
            <span key={i} className="leading-[1.65] text-[10px]">{i + 1}</span>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          id="log-input-textarea"
          value={value}
          onChange={(e) => onChange({ log: e.target.value, suggestedMode: null })}
          disabled={disabled}
          rows={16}
          placeholder="Paste raw log entries here…

Examples:
  081109 203615 148 ERROR dfs.DataNode: Block corrupted
  2024-01-15 10:22:31 WARN auth: Failed login attempt from 192.168.1.x
  Show me all failed logins in the last 24 hours"
          className="log-textarea w-full rounded-xl p-3 pl-12 disabled:opacity-50
                     disabled:cursor-not-allowed"
        />

        {/* Character count */}
        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-soc-muted/60">
          {value.length.toLocaleString()} chars
        </div>
      </div>
    </div>
  );
}
