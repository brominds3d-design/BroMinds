import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { getActiveCampaigns } from '@/data/catalog'
import { PromoCampaign, campaignStatus } from '@/lib/promo'

/**
 * Temas sazonais do site (Black Friday e Natal).
 *
 * Ligam-se sozinhos quando há uma campanha a decorrer com esse tema
 * (escolhido no admin, em Promoções → Campanhas). Se as duas estiverem
 * a decorrer ao mesmo tempo, ganha a Black Friday.
 *
 *  - Marca o <html> com data-theme="black-friday" ou "natal";
 *    as cores mudam no CSS (ver seasonal-themes.css).
 *  - Black Friday: cortina que abre sozinha (uma vez por visita), cabeçalho
 *    preto e faixa com contagem. O resto do site mantém as cores normais.
 *  - Natal: faixa vermelha no topo + neve a cair.
 *  - Nos dois: gorro de Natal no logótipo (feito no CSS).
 */

type Theme = 'black-friday' | 'natal'
const THEMES: Theme[] = ['black-friday', 'natal'] // por ordem de prioridade
const SPLASH_KEY = 'brominds_bf_splash_seen'

function maxPercent(campaign: PromoCampaign) {
  return Math.max(0, ...campaign.rules.map((r: any) => Number(r.percent) || 0))
}

function useSeasonalCampaign() {
  const [active, setActive] = useState<{ theme: Theme; campaign: PromoCampaign } | null>(null)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      const campaigns = (await getActiveCampaigns()).filter(
        (c) => campaignStatus(c) === 'live',
      )
      let found: { theme: Theme; campaign: PromoCampaign } | null = null
      for (const theme of THEMES) {
        const campaign = campaigns.find((c) => c.theme === theme)
        if (campaign) {
          found = { theme, campaign }
          break
        }
      }
      if (!cancelled) setActive(found)
    }

    void check()
    const timer = setInterval(() => void check(), 60_000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  // Marca a página para o CSS do tema
  useEffect(() => {
    const root = document.documentElement
    if (active) root.dataset.theme = active.theme
    else if (THEMES.includes(root.dataset.theme as Theme)) delete root.dataset.theme
  }, [active])

  return active
}

function useCountdown(endsAt: string | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!endsAt) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [endsAt])

  if (!endsAt) return null
  const diff = Math.max(0, new Date(endsAt).getTime() - now)
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function SeasonalTheme() {
  const active = useSeasonalCampaign()
  if (!active) return null

  return active.theme === 'black-friday' ? (
    <BlackFriday campaign={active.campaign} />
  ) : (
    <Natal campaign={active.campaign} />
  )
}

// ============================================================
// BLACK FRIDAY
// ============================================================

function BlackFriday({ campaign }: { campaign: PromoCampaign }) {
  const countdown = useCountdown(campaign.ends_at)
  // closed = cortina fechada | opening = a abrir | hidden = já abriu
  const [curtain, setCurtain] = useState<'hidden' | 'closed' | 'opening'>('hidden')

  // A cortina aparece uma vez por visita e abre sozinha
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(SPLASH_KEY) === '1'
    } catch {
      // sem sessionStorage: mostra na mesma
    }
    if (seen) return

    setCurtain('closed')
    const timer = setTimeout(() => openCurtain(), 1900)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sem scroll enquanto a cortina está fechada
  useEffect(() => {
    if (curtain === 'hidden') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [curtain])

  function openCurtain() {
    try {
      sessionStorage.setItem(SPLASH_KEY, '1')
    } catch {
      // ignora
    }
    setCurtain((current) => (current === 'closed' ? 'opening' : current))
    setTimeout(() => setCurtain('hidden'), 1200)
  }

  const percent = maxPercent(campaign)
  const endText = campaign.ends_at
    ? new Date(new Date(campaign.ends_at).getTime() - 1).toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
      })
    : null

  // O mesmo conteúdo vai nas duas metades: cada uma mostra o seu lado,
  // por isso o texto parte-se ao meio quando a cortina abre.
  const curtainContent = (
    <>
      <p className="bf-curtain-kicker">BroMinds apresenta</p>
      <p className="bf-curtain-title">
        BLACK
        <br />
        <span>FRIDAY</span>
      </p>
      {percent > 0 && (
        <p className="bf-curtain-percent">
          até <span>−{percent}%</span>
        </p>
      )}
      {endText && <p className="bf-curtain-date">Só até {endText}</p>}
    </>
  )

  return (
    <>
      {/* Faixa no topo */}
      <div className="bf-bar relative z-[55] bg-black text-white">
        <Link
          to="/catalogo"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] sm:text-sm"
        >
          <span>
            <span className="text-[#ff2e3b]">Black Friday</span>
            {percent > 0 && <> · até −{percent}% em peças impressas em 3D</>}
          </span>
          {countdown && (
            <span className="font-mono tracking-normal text-[#ffd84d]">
              Acaba em {countdown.d > 0 && `${countdown.d}d `}
              {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
            </span>
          )}
        </Link>
      </div>

      {/* Neve leve */}
      <Snow count={12} />

      {/* Cortina */}
      {curtain !== 'hidden' && (
        <div
          className={`bf-curtain ${curtain === 'opening' ? 'is-open' : ''}`}
          role="presentation"
          onClick={openCurtain}
        >
          <div className="bf-curtain-half bf-curtain-left">
            <div className="bf-curtain-inner">{curtainContent}</div>
          </div>
          <div className="bf-curtain-half bf-curtain-right" aria-hidden="true">
            <div className="bf-curtain-inner">{curtainContent}</div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================================
// NATAL
// ============================================================

function Natal({ campaign }: { campaign: PromoCampaign }) {
  const percent = maxPercent(campaign)

  return (
    <>
      {/* Faixa no topo */}
      <div className="natal-bar relative z-[55] text-white">
        <Link
          to="/packs-natal"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-xs font-bold tracking-wide sm:text-sm"
        >
          <span>🎄 {campaign.name || 'Natal na BroMinds'}</span>
          {percent > 0 && <span className="text-[#ffe08a]">até −{percent}%</span>}
          <span className="underline underline-offset-2">Cria o teu pack de Natal →</span>
        </Link>
      </div>

      {/* Neve */}
      <Snow count={28} />
    </>
  )
}

// ============================================================
// NEVE (usada no Natal e, mais leve, na Black Friday)
// ============================================================

function Snow({ count }: { count: number }) {
  // Flocos com tamanhos, posições e velocidades fixas (iguais em cada visita)
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280
        return {
          left: `${Math.round(r(1) * 100)}%`,
          size: 4 + Math.round(r(2) * 6),
          duration: 9 + Math.round(r(3) * 10),
          delay: -Math.round(r(4) * 18),
          drift: Math.round(r(5) * 40) - 20,
          opacity: 0.35 + r(6) * 0.45,
        }
      }),
    [count],
  )

  return (
    <div className="natal-snow pointer-events-none fixed inset-0 z-[45] overflow-hidden" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="natal-flake"
          style={
            {
              left: f.left,
              width: f.size,
              height: f.size,
              opacity: f.opacity,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              '--drift': `${f.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}