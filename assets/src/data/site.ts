/**
 * Configuracao da marca e dos contactos.
 *
 * ====================================================================
 *  A SUBSTITUIR ANTES DE DIVULGAR O SITE
 *  Os contactos abaixo sao valores de exemplo. Todos os botoes
 *  "Encomendar" do site sao construidos a partir deste ficheiro, por
 *  isso muda-se aqui uma vez e fica corrigido em todas as paginas.
 * ====================================================================
 */

/** Canal para onde o botao "Encomendar" encaminha o visitante. */
export type OrderChannel = 'email' | 'whatsapp' | 'instagram'

export const site = {
  name: 'DuoPixel',
  tagline: 'Impressão 3D feita em casa, peça a peça',
  description:
    'Catálogo de peças impressas em 3D pela DuoPixel: decoração de Halloween e de Natal, organizadores para casa e peças personalizadas. Encomendas por mensagem.',
  location: 'Leiria, Portugal',

  /** Canal usado pelos botoes de encomenda. Muda para 'whatsapp' ou 'instagram' quando quiseres. */
  orderChannel: 'email' as OrderChannel,

  contact: {
    // A SUBSTITUIR pelo endereco real
    email: 'ola@duopixel.pt',
    // A SUBSTITUIR pelo utilizador real de Instagram (sem @)
    instagram: 'duopixel.pt',
    // A SUBSTITUIR pelo numero real, em formato internacional e sem simbolos: 351XXXXXXXXX
    whatsapp: '351900000000',
  },

  /** Tempos e condicoes mostrados nas paginas de produto e de contacto. */
  info: {
    prazo: '2 a 4 dias úteis para peças em stock',
    prazoPersonalizado: '3 a 5 dias úteis para peças personalizadas',
    envio: 'Envio CTT para todo o país, 3,50 €. Entrega em mão em Leiria sem custo.',
    pagamento: 'MB WAY ou transferência, após confirmarmos a encomenda por mensagem.',
  },
} as const

export const instagramUrl = `https://instagram.com/${site.contact.instagram}`
export const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`
export const emailUrl = `mailto:${site.contact.email}`

/**
 * Constroi o link de encomenda para um produto, com a mensagem ja preenchida
 * no canal escolhido. Sem produto, devolve um link de contacto generico.
 */
export function orderLink(options?: {
  productName?: string
  color?: string
}): string {
  const { productName, color } = options ?? {}

  const subject = productName
    ? `Encomenda: ${productName}`
    : `Pedido de informação — ${site.name}`

  const body = productName
    ? `Olá! Gostaria de encomendar "${productName}"${
        color ? ` na cor ${color}` : ''
      }.\n\nQuantidade: 1\nNome:\nLocalidade:`
    : `Olá! Gostaria de saber mais sobre as vossas peças.`

  switch (site.orderChannel) {
    case 'whatsapp':
      return `${whatsappUrl}?text=${encodeURIComponent(body)}`
    case 'instagram':
      // O Instagram nao aceita mensagens pre-preenchidas por link.
      return instagramUrl
    case 'email':
    default:
      return `${emailUrl}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`
  }
}

/** Rotulo do botao de encomenda, adaptado ao canal configurado. */
export function orderChannelLabel(): string {
  switch (site.orderChannel) {
    case 'whatsapp':
      return 'Encomendar por WhatsApp'
    case 'instagram':
      return 'Encomendar por Instagram'
    case 'email':
    default:
      return 'Encomendar por email'
  }
}
