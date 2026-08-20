interface LogoProps {
  size?: number
}

export function LogoMark({ size = 36 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 3L42 11v13c0 11.5-7.7 18.6-18 21C13.7 42.6 6 35.5 6 24V11L24 3z"
        fill="#12060A"
        stroke="#DC2626"
        strokeWidth="2.5"
      />
      <path
        d="M31 17.5A9.5 9.5 0 1 0 31 30.5"
        stroke="#DC2626"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className={`block text-base font-extrabold tracking-widest ${light ? 'text-text-on-light' : 'text-white'}`}>
          CYBERAS
        </span>
        <span className="block text-[9px] font-semibold tracking-[0.35em] text-brand">
          INTELLIGENCE
        </span>
      </span>
    </span>
  )
}
