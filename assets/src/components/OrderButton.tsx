import { MessageCircle } from 'lucide-react'
import { orderChannelLabel, orderLink } from '@/data/site'

/**
 * Botao "Encomendar".
 *
 * Nao existe carrinho nesta versao: o botao abre o canal de contacto
 * configurado em `src/data/site.ts`, com a mensagem e o nome do produto ja
 * preenchidos, para a encomenda chegar como mensagem directa.
 */
export function OrderButton({
  productName,
  className = '',
  size = 'md',
}: {
  productName?: string
  className?: string
  size?: 'md' | 'lg'
}) {
  return (
    <a
      href={orderLink({ productName })}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-card bg-ink font-semibold text-paper transition-[transform,background-color] duration-200 hover:bg-plum active:scale-[0.985] ${
        size === 'lg' ? 'px-6 py-4 text-[0.98rem]' : 'px-5 py-3 text-[0.9rem]'
      } ${className}`}
    >
      <MessageCircle
        className="h-4 w-4 text-ember transition-transform duration-300 group-hover:-rotate-12"
        aria-hidden="true"
      />
      {productName ? 'Encomendar' : orderChannelLabel()}
    </a>
  )
}
