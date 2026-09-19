import { Link } from '@tanstack/react-router'

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <img
      src="/img/logo-brominds.png"
      alt="BroMinds"
      className={`${className} object-contain`}
    />
  )
}

export function Wordmark({ className = 'text-ink' }: { className?: string }) {
  return (
    <span className={`font-display text-xl font-extrabold tracking-tight ${className}`}>
      Bro<span className="text-ember">Minds</span>
    </span>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8" />
      <Wordmark />
    </Link>
  )
}