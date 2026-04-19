function StatCard({ id, label, value, unit, color, icon, pulse }) {
  return (
    <div id={id} className="stat-card border border-soc-border">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-[10px] font-mono text-soc-subtext uppercase tracking-widest">{label}</span>
        {pulse && (
          <span className={`ml-auto w-1.5 h-1.5 rounded-full ${pulse} animate-pulse-slow`} />
        )}
      </div>
      <div className={`font-mono font-bold text-2xl ${color}`}>
        {value}
        {unit && <span className="text-xs ml-1 opacity-60">{unit}</span>}
      </div>
    </div>
  );
}

export default function StatsBar({ stats }) {
  const { total, anomalies, normal, avgMs } = stats;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        id="stat-total"
        label="Total Analyzed"
        value={total}
        icon="📊"
        color="text-soc-cyan"
        pulse="bg-soc-cyan"
      />
      <StatCard
        id="stat-anomalies"
        label="Anomalies"
        value={anomalies}
        icon="🚨"
        color={anomalies > 0 ? 'text-soc-red' : 'text-soc-muted'}
        pulse={anomalies > 0 ? "bg-soc-red" : null}
      />
      <StatCard
        id="stat-normal"
        label="Normal Logs"
        value={normal}
        icon="✅"
        color="text-soc-green"
        pulse={normal > 0 ? "bg-soc-green" : null}
      />
      <StatCard
        id="stat-avgms"
        label="Avg Response"
        value={avgMs > 0 ? avgMs.toLocaleString() : '—'}
        unit={avgMs > 0 ? 'ms' : ''}
        icon="⚡"
        color="text-soc-yellow"
      />
    </div>
  );
}
