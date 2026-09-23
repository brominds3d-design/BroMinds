import React, { useState } from 'react'
import { X, Heart, User, AtSign } from 'lucide-react'
import { loginOrRegisterHandle, CustomerUser } from '@/lib/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: CustomerUser) => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const user = await loginOrRegisterHandle(handle, name)
      onSuccess(user)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl border border-paper-3 bg-paper p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ember/10 text-ember">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <h3 className="text-xl font-extrabold text-ink">Guarda os teus Favoritos</h3>
          <p className="mt-1 text-xs text-ink-3">
            Sem passwords nem emails chatos. Escolhe o teu @arroba para acederes à tua lista sempre que voltares.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 p-2.5 text-center text-xs font-semibold text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-2">
              O teu @ (Identificador)
            </label>
            <div className="flex items-center rounded-xl border border-paper-3 bg-paper-2 px-3 py-2 focus-within:border-ember">
              <AtSign className="mr-1.5 h-4 w-4 text-ink-3" />
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="ex: tiago ou martas"
                className="w-full bg-transparent text-sm text-ink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-2">
              O teu Nome (Opcional)
            </label>
            <div className="flex items-center rounded-xl border border-paper-3 bg-paper-2 px-3 py-2 focus-within:border-ember">
              <User className="mr-1.5 h-4 w-4 text-ink-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Tiago Costa"
                className="w-full bg-transparent text-sm text-ink outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-ember py-3 text-sm font-semibold text-paper shadow-md transition hover:bg-ember-deep disabled:opacity-50"
          >
            {loading ? 'A validar...' : 'Entrar / Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}