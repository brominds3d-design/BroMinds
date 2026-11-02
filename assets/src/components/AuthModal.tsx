import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, Mail, User, X } from 'lucide-react'
import { CustomerUser, loginWithEmail, registerWithEmail } from '@/lib/auth'

/**
 * Janela de login da BroMinds.
 * Passo 1: e-mail. Se já existir, entra logo.
 * Passo 2 (só para quem é novo): escolhe o @ e o nome.
 */
export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: CustomerUser) => void
}) {
  const [step, setStep] = useState<'email' | 'profile'>('email')
  const [email, setEmail] = useState('')
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)
  const handleRef = useRef<HTMLInputElement>(null)

  // Ao abrir, volta ao início
  useEffect(() => {
    if (!isOpen) return
    setStep('email')
    setHandle('')
    setName('')
    setError('')
    setLoading(false)
    setTimeout(() => emailRef.current?.focus(), 50)
  }, [isOpen])

  useEffect(() => {
    if (step === 'profile') setTimeout(() => handleRef.current?.focus(), 50)
  }, [step])

  // Fechar com Esc
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const finish = (user: CustomerUser) => {
    onClose()
    onSuccess?.(user)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await loginWithEmail(email)
      if ('user' in result) {
        finish(result.user)
      } else {
        setStep('profile')
      }
    } catch (err: any) {
      setError(err?.message || 'Não foi possível entrar. Tenta outra vez.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await registerWithEmail(email, handle, name)
      finish(user)
    } catch (err: any) {
      setError(err?.message || 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-paper-3 bg-paper-2 p-3 pl-10 text-sm text-ink outline-none transition focus:border-ember'

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="w-full max-w-sm rounded-2xl border border-paper-3 bg-paper p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="auth-title" className="text-xl font-extrabold text-ink">
              {step === 'email' ? 'Entrar' : 'Bem-vindo(a)!'}
            </h2>
            <p className="mt-1 text-xs leading-5 text-ink-3">
              {step === 'email'
                ? 'Só precisas do teu e-mail. Ficas com a sessão guardada neste dispositivo.'
                : 'É a tua primeira vez. Escolhe como queres aparecer.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-ink-3 transition hover:bg-paper-2 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
              <input
                ref={emailRef}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="o.teu@email.com"
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ember py-3 text-sm font-semibold text-paper shadow-sm transition hover:bg-ember-deep disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Continuar
            </button>
          </form>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <p className="rounded-lg bg-paper-2 px-3 py-2 text-xs text-ink-2">
              {email}
            </p>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-2">
                O teu @
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-3">
                  @
                </span>
                <input
                  ref={handleRef}
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="ex.: maria_silva"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-2">
                Nome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como te chamas?"
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ember py-3 text-sm font-semibold text-paper shadow-sm transition hover:bg-ember-deep disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar conta e entrar
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email')
                setError('')
              }}
              className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-ink-3 hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Usar outro e-mail
            </button>
          </form>
        )}
      </div>
    </div>
  )
}