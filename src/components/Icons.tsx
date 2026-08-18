import {
  Heart,
  HeartFill,
  Star,
  StarFill,
  MapPin,
  Search,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Chat,
  Clock,
  Gear,
  ChevronRight,
  Filter,
  Envelope,
  Eye,
  HandThumbsUp,
  CurrencyDollar,
  Hourglass,
  Wrench,
  ExclamationTriangle,
  Telephone,
  Paperclip,
  X,
} from 'react-bootstrap-icons'

export function IconHeart({ filled = false, className = '' }: { filled?: boolean; className?: string }) {
  return filled ? <HeartFill className={className} /> : <Heart className={className} />
}

export function IconStar({ filled = false, className = '' }: { filled?: boolean; className?: string }) {
  return filled ? <StarFill className={className} /> : <Star className={className} />
}

export function IconMapPin({ className = '' }: { className?: string }) {
  return <MapPin className={className} />
}

export function IconSearch({ className = '' }: { className?: string }) {
  return <Search className={className} />
}

export function IconCheck({ className = '' }: { className?: string }) {
  return <CheckCircle className={className} />
}

export function IconError({ className = '' }: { className?: string }) {
  return <XCircle className={className} />
}

export function IconShield({ className = '' }: { className?: string }) {
  return <ShieldCheck className={className} />
}

export function IconChat({ className = '' }: { className?: string }) {
  return <Chat className={className} />
}

export function IconClock({ className = '' }: { className?: string }) {
  return <Clock className={className} />
}

export function IconGear({ className = '' }: { className?: string }) {
  return <Gear className={className} />
}

export function IconChevronRight({ className = '' }: { className?: string }) {
  return <ChevronRight className={className} />
}

export function IconFilter({ className = '' }: { className?: string }) {
  return <Filter className={className} />
}

export function IconEnvelope({ className = '' }: { className?: string }) {
  return <Envelope className={className} />
}

export function IconEye({ className = '' }: { className?: string }) {
  return <Eye className={className} />
}

export function IconHandshake({ className = '' }: { className?: string }) {
  return <HandThumbsUp className={className} />
}

export function IconMoney({ className = '' }: { className?: string }) {
  return <CurrencyDollar className={className} />
}

export function IconHourglass({ className = '' }: { className?: string }) {
  return <Hourglass className={className} />
}

export function IconWrench({ className = '' }: { className?: string }) {
  return <Wrench className={className} />
}

export function IconWarning({ className = '' }: { className?: string }) {
  return <ExclamationTriangle className={className} />
}

export function IconPhone({ className = '' }: { className?: string }) {
  return <Telephone className={className} />
}

export function IconAttachment({ className = '' }: { className?: string }) {
  return <Paperclip className={className} />
}

export function IconClose({ className = '' }: { className?: string }) {
  return <X className={className} />
}
