interface BalanceCapsuleProps {
  balance: number
  onAdd?: () => void
}

export function BalanceCapsule({ balance, onAdd }: BalanceCapsuleProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] shadow-[0_0_0_1px_rgba(34,197,94,0.06)]">
      <span className="font-bold text-white tabular-nums text-sm">
        {balance.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </span>
      <span className="text-[10px] font-semibold text-[var(--accent-emerald)]/90 uppercase tracking-wider">USDT</span>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center text-lg leading-none font-bold active:scale-95 transition-all hover:bg-white/15"
        >
          +
        </button>
      )}
    </div>
  )
}
