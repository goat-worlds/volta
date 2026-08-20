import type { JSX } from 'react'

const ICON_MAP: Record<string, (props: { className?: string }) => JSX.Element> = {
  'pelle': ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 20h16M6 8v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8M9 4h6v4H9z"/>
    </svg>
  ),
  'chargeuse': ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 15h3v6H3zM7 8h10v13H7zM17 8h4v6h-4z" opacity="0.8"/>
      <circle cx="6" cy="19" r="2"/>
      <circle cx="18" cy="19" r="2"/>
    </svg>
  ),
  'benne': ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 18h20v2H2zM3 15h6l3-6H3zM9 15h12l-3-6H9z"/>
      <circle cx="6" cy="19" r="2"/>
      <circle cx="18" cy="19" r="2"/>
    </svg>
  ),
  'bulldozer': ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="12" width="14" height="8" rx="1"/>
      <path d="M12 8v4M16 8v4M3 20h18"/>
      <circle cx="5" cy="20" r="2"/>
      <circle cx="19" cy="20" r="2"/>
    </svg>
  ),
  'compacteur': ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="14" r="6" opacity="0.8"/>
      <rect x="8" y="4" width="8" height="6" rx="1"/>
      <circle cx="5" cy="20" r="2"/>
      <circle cx="19" cy="20" r="2"/>
    </svg>
  ),
  'grue': ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <line x1="12" y1="2" x2="12" y2="8" strokeWidth="2" stroke="currentColor"/>
      <path d="M12 8l-3 2 3 2 3-2z" opacity="0.6"/>
      <path d="M6 10v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8"/>
      <circle cx="8" cy="20" r="1.5"/>
      <circle cx="16" cy="20" r="1.5"/>
    </svg>
  ),
}

export function IconDisplay({ icon, alt = '', className = 'w-5 h-5' }: { icon: string; alt?: string; className?: string }) {
  // Try to find icon in map first
  const IconComponent = ICON_MAP[icon.toLowerCase()]
  if (IconComponent) {
    return <div className="text-brand-600"><IconComponent className={className} /></div>
  }

  // Fall back to image files
  if (icon.endsWith('.svg') || icon.endsWith('.jpg') || icon.endsWith('.png')) {
    return <img src={icon} alt={alt} className={`${className} object-cover`} />
  }

  // Fallback for unknown icons
  return <div className={`${className} flex items-center justify-center text-xs font-bold text-slate-400`}>?</div>
}
