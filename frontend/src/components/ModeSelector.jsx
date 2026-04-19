import { MODES } from '../constants';

export default function ModeSelector({ selected, onSelect, disabled }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-soc-cyan font-mono text-xs font-bold tracking-widest uppercase">
        &gt; Analysis Mode
      </span>

      <div className="grid grid-cols-3 gap-2">
        {MODES.map((mode) => {
          const isActive = selected === mode.id;
          return (
            <button
              key={mode.id}
              id={`btn-mode-${mode.id}`}
              onClick={() => onSelect(mode.id)}
              disabled={disabled}
              className={`
                rounded-xl border px-3 py-3 flex flex-col items-center gap-1.5 text-center
                transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                ${isActive ? 'mode-active' : 'mode-inactive'}
              `}
            >
              <span className="text-xl leading-none">{mode.icon}</span>
              <span className="font-semibold text-xs leading-tight">{mode.label}</span>
              <span className="text-[10px] opacity-70 leading-tight hidden sm:block">
                {mode.description}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-soc-cyan
                                 shadow-glow-cyan animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
