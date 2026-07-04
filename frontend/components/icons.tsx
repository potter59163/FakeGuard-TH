// ไอคอน SVG กลางของเว็บ (เส้นแบบ heroicons-outline)
type IconProps = { className?: string };

const base = "h-5 w-5";

export function ShieldIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7.5 3v5.25c0 4.6-3.2 8.06-7.5 9.75-4.3-1.69-7.5-5.15-7.5-9.75V6L12 3z"
      />
    </svg>
  );
}

export function ShieldCheckIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7.5 3v5.25c0 4.6-3.2 8.06-7.5 9.75-4.3-1.69-7.5-5.15-7.5-9.75V6L12 3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12l2 2 3.5-4" />
    </svg>
  );
}

export function SearchIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path strokeLinecap="round" d="M15.5 15.5L21 21" />
    </svg>
  );
}

export function ChartIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" d="M4 20h16" />
      <rect x="6" y="11" width="3" height="6" rx="0.8" />
      <rect x="11" y="7" width="3" height="10" rx="0.8" />
      <rect x="16" y="13" width="3" height="4" rx="0.8" />
    </svg>
  );
}

export function InfoIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 10.5V17" />
      <circle cx="12" cy="7.5" r="0.4" fill="currentColor" />
    </svg>
  );
}

export function NewspaperIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 20H6.5A2.5 2.5 0 014 17.5V5a1 1 0 011-1h11a1 1 0 011 1v12.5a1.5 1.5 0 003 0V8h-2"
      />
      <path strokeLinecap="round" d="M7.5 8h6M7.5 11.5h6M7.5 15h4" />
    </svg>
  );
}

export function AlertTriangleIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5l9 15.5H3l9-15.5z"
      />
      <path strokeLinecap="round" d="M12 10v4.5" />
      <circle cx="12" cy="17.2" r="0.4" fill="currentColor" />
    </svg>
  );
}

export function CheckCircleIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.5 2.5 4.5-5.5" />
    </svg>
  );
}

export function MoonIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"
      />
    </svg>
  );
}

export function RefreshIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12a7.5 7.5 0 0112.8-5.3L20 9.5m0 0V4.5m0 5h-5M19.5 12a7.5 7.5 0 01-12.8 5.3L4 14.5m0 0v5m0-5h5"
      />
    </svg>
  );
}

export function UserIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" d="M5.5 20a6.5 6.5 0 0113 0" />
    </svg>
  );
}

export function BookIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.5C10.5 5 8.5 4.5 4 4.5v14c4.5 0 6.5.5 8 2 1.5-1.5 3.5-2 8-2v-14c-4.5 0-6.5.5-8 2zm0 0v14"
      />
    </svg>
  );
}

export function CpuIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="10" y="10" width="4" height="4" rx="0.8" />
      <path strokeLinecap="round" d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </svg>
  );
}

export function TrophyIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 4h8v5a4 4 0 01-8 0V4zM8 5H4.5a3.5 3.5 0 003.6 3.9M16 5h3.5a3.5 3.5 0 01-3.6 3.9M12 13v4m-3.5 3h7m-5.5-3h4"
      />
    </svg>
  );
}
