const SEVERITY_STYLES = {
  NORMAL:   'badge-normal',
  WARNING:  'badge-warning',
  CRITICAL: 'badge-critical',
};

const MODE_LABELS = {
  anomaly: 'Anomaly',
  rca:     'RCA',
  nl2sql:  'NL→SQL',
};

function truncate(str, n = 60) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export default function LogHistoryTable({ history }) {
  if (!history.length) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-soc-cyan font-mono text-xs font-bold tracking-widest uppercase">
          &gt; Log History
        </span>
        <div className="glass rounded-xl border border-soc-border p-8 text-center">
          <p className="font-mono text-xs text-soc-muted">No logs analyzed yet this session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-soc-cyan font-mono text-xs font-bold tracking-widest uppercase">
          &gt; Log History
          <span className="ml-2 text-soc-subtext font-normal">({history.length}/10)</span>
        </span>
      </div>

      <div className="glass rounded-xl border border-soc-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-soc-border/60 bg-black/30">
                {['Timestamp', 'Log Snippet', 'Mode', 'Result', 'Severity'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest
                               uppercase text-soc-subtext whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr
                  key={row.id}
                  className={`history-row border-b border-soc-border/30 last:border-0
                              ${i === 0 ? 'animate-slide-up' : ''}`}
                >
                  {/* Timestamp */}
                  <td className="px-4 py-2.5 text-soc-subtext whitespace-nowrap text-[10px]">
                    {row.timestamp}
                  </td>

                  {/* Log snippet */}
                  <td className="px-4 py-2.5 text-soc-text max-w-[200px]">
                    <span className="text-soc-green text-[10px]">{truncate(row.log)}</span>
                  </td>

                  {/* Mode */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="text-soc-muted border border-soc-border px-1.5 py-0.5 rounded text-[10px]">
                      {MODE_LABELS[row.mode] || row.mode}
                    </span>
                  </td>

                  {/* Result snippet */}
                  <td className="px-4 py-2.5 text-soc-text max-w-[200px] text-[10px]">
                    {truncate(row.result, 50)}
                  </td>

                  {/* Severity badge */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`${SEVERITY_STYLES[row.severity] || 'badge-normal'}
                                     text-[10px] px-2 py-0.5 rounded-full font-bold`}>
                      {row.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
