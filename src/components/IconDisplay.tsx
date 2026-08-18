export function IconDisplay({ icon, alt = '', className = 'w-5 h-5' }: { icon: string; alt?: string; className?: string }) {
  if (icon.endsWith('.svg') || icon.endsWith('.jpg') || icon.endsWith('.png')) {
    return <img src={icon} alt={alt} className={`${className} object-cover`} />
  }
  return <span className="text-xl">{icon}</span>
}
