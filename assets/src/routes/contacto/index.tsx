import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { site } from '@/data/site'
import {
  MessageCircle,
  Mail,
  Phone,
  Send,
  Sparkles,
  Clock,
  ChevronRight,
} from 'lucide-react'

export const Route = createFileRoute('/contacto/')({
  component: ContactoPage,
})

function ContactoPage() {
  const [nome, setNome] = useState('')
  const [contactoPref, setContactoPref] = useState<'tiago' | 'ines'>('tiago')
  const [mensagem, setMensagem] = useState('')
  const [dimensoes, setDimensoes] = useState('')

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const destinatario =
      contactoPref === 'ines'
        ? site.team.ines.rawPhone
        : site.team.tiago.rawPhone

    const texto = encodeURIComponent(
      `Olá ${contactoPref === 'ines' ? 'Inês' : 'Tiago'} (BroMinds)!\n` +
      `Chamo-me ${nome || 'um cliente'}.\n\n` +
      `Gostava de pedir informações / orçamento para um projeto 3D:\n` +
      `• Detalhes: ${mensagem}\n` +
      (dimensoes ? `• Medidas pretendidas: ${dimensoes}\n` : '')
    )

    window.open(`https://wa.me/${destinatario}?text=${texto}`, '_blank')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <nav className="mb-6 flex items-center gap-2 text-xs text-ink-3">
        <a href="/" className="hover:text-ink">Início</a>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-ink">Contacto & Orçamentos</span>
      </nav>

      <div className="mb-10 max-w-2xl">
        <span className="label-mono mb-2 inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-2 px-3 py-1 text-xs text-ink-2">
          <Sparkles className="h-3.5 w-3.5 text-ember" />
          Projetos & Apoio
        </span>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          Fala connosco
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Tens um ficheiro STL próprio ou queres uma peça com medidas e cores personalizadas? Fala connosco diretamente por WhatsApp ou Email.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="rounded-2xl border border-paper-3 bg-paper p-6 sm:p-8 shadow-sm lg:col-span-7">
          <h2 className="text-xl font-bold text-ink">Pedir Orçamento sem Compromisso</h2>
          <p className="mt-1 text-xs text-ink-3">
            Preenche os detalhes para enviar a mensagem formatada para o nosso WhatsApp.
          </p>

          <form onSubmit={handleWhatsAppSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                O teu Nome
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full rounded-xl border border-paper-3 bg-paper-2 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ember focus:bg-paper"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                Falar com
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setContactoPref('tiago')}
                  className={`rounded-xl border p-3 text-left transition ${
                    contactoPref === 'tiago'
                      ? 'border-ink bg-ink text-paper'
                      : 'border-paper-3 bg-paper hover:bg-paper-2 text-ink'
                  }`}
                >
                  <p className="text-sm font-semibold">{site.team.tiago.name}</p>
                  <p className="text-xs opacity-75">{site.team.tiago.role}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setContactoPref('ines')}
                  className={`rounded-xl border p-3 text-left transition ${
                    contactoPref === 'ines'
                      ? 'border-ink bg-ink text-paper'
                      : 'border-paper-3 bg-paper hover:bg-paper-2 text-ink'
                  }`}
                >
                  <p className="text-sm font-semibold">{site.team.ines.name}</p>
                  <p className="text-xs opacity-75">{site.team.ines.role}</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                Dimensões estimadas (opcional)
              </label>
              <input
                type="text"
                value={dimensoes}
                onChange={(e) => setDimensoes(e.target.value)}
                placeholder="Ex: 15cm de altura, cerca de 10x10cm..."
                className="w-full rounded-xl border border-paper-3 bg-paper-2 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ember focus:bg-paper"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                Descrição da ideia ou modelo
              </label>
              <textarea
                required
                rows={4}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreve a peça pretendida, cores ou acabamentos..."
                className="w-full resize-none rounded-xl border border-paper-3 bg-paper-2 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ember focus:bg-paper"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-ember py-3.5 px-6 font-semibold text-paper shadow-md transition hover:bg-ember-deep active:scale-[0.99]"
            >
              <Send className="h-4 w-4" />
              Enviar Mensagem pelo WhatsApp
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          {/* Tiago */}
          <div className="rounded-2xl border border-paper-3 bg-paper p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ember/10 text-ember">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">{site.team.tiago.name}</h3>
                <p className="text-xs text-ink-3">{site.team.tiago.role}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-paper-3 pt-3">
              <a
                href={`tel:${site.team.tiago.rawPhone}`}
                className="text-xs font-mono font-medium text-ink hover:text-ember"
              >
                {site.team.tiago.phone}
              </a>
              <a
                href={`https://wa.me/${site.team.tiago.rawPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Inês */}
          <div className="rounded-2xl border border-paper-3 bg-paper p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ember/10 text-ember">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">{site.team.ines.name}</h3>
                <p className="text-xs text-ink-3">{site.team.ines.role}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-paper-3 pt-3">
              <a
                href={`tel:${site.team.ines.rawPhone}`}
                className="text-xs font-mono font-medium text-ink hover:text-ember"
              >
                {site.team.ines.phone}
              </a>
              <a
                href={`https://wa.me/${site.team.ines.rawPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="rounded-2xl border border-paper-3 bg-paper p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-3 text-ink">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Email Direto</h3>
                <p className="text-xs text-ink-3">Para envio de ficheiros STL/OBJ e orçamentos</p>
              </div>
            </div>
            <div className="mt-4 border-t border-paper-3 pt-3">
              <a
                href={`mailto:${site.contact.email}`}
                className="text-xs font-mono font-medium text-ink hover:text-ember"
              >
                {site.contact.email}
              </a>
            </div>
          </div>

          {/* Prazos */}
          <div className="rounded-2xl border border-paper-3 bg-paper-2 p-5 text-xs text-ink-2">
            <div className="flex items-center gap-2 font-semibold text-ink mb-2">
              <Clock className="h-4 w-4 text-ember" />
              <span>Prazo de Produção: {site.info.prazo}</span>
            </div>
            <p className="leading-relaxed">
              Produzimos sob encomenda com filamento PLA/PETG de alta qualidade e fazemos verificação dimensional antes de enviar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}