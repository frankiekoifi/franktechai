export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="brand-gradient relative grid shrink-0 place-items-center rounded-xl shadow-[0_0_24px_rgba(34,211,238,0.35)]"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="none" aria-hidden>
        <path d="M5 4h11M5 4v16M5 11.5h8" stroke="#05070f" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="18" cy="17" r="2.6" fill="#05070f" />
        <path d="M13 11.5l5 5.5" stroke="#05070f" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function LogoFull() {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight text-white">
          FrankTechSpace <span className="brand-text">AI</span>
        </div>
        <div className="text-[11px] text-slate-400">Your technical &amp; digital assistant</div>
      </div>
    </div>
  );
}
