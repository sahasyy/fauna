interface SiteMarkProps {
  detail?: string;
  inverted?: boolean;
}

export function SiteMark({ detail, inverted = false }: SiteMarkProps) {
  const textTone = inverted
    ? "text-[color:var(--color-cream)]"
    : "text-[color:var(--color-navy)]";
  const detailTone = inverted
    ? "text-[color:var(--color-cream-soft)]"
    : "text-[color:var(--color-text-faint)]";

  return (
    <div className={`flex items-center gap-3 ${textTone}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-current/15 bg-current/5">
        <svg width="21" height="21" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9.5" stroke="currentColor" strokeWidth="1" />
          <path
            d="M6.5 13C8.4 9.3 13.6 9.3 15.5 13"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="11" cy="11" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <div>
        <p className="font-display text-[1.45rem] leading-none tracking-[-0.04em]">
          Fauna
        </p>
        {detail ? (
          <p className={`mt-1 text-[0.65rem] uppercase tracking-[0.28em] ${detailTone}`}>
            {detail}
          </p>
        ) : null}
      </div>
    </div>
  );
}
