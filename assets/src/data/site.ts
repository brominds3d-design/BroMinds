/**
 * Configuracao da marca e dos contactos — BroMinds.
 * Todos os botoes de encomenda e contactos do site sao gerados a partir daqui.
 */

/** Canal para onde o botao "Encomendar" encaminha o visitante. */
export type OrderChannel = 'whatsapp' | 'email' | 'instagram'

export const site = {
  name: 'BroMinds',
  tagline: 'Impressão 3D & Design Criativo',
  description:
    'Catálogo de peças decorativas e utilitárias impressas em 3D pela BroMinds. Encomendas personalizadas com acabamento de alta qualidade.',
  location: 'Portugal',

  /** Canal principal de encomenda ativado por defeito */
  orderChannel: 'whatsapp' as OrderChannel,

  contact: {
    email: 'brominds3d@gmail.com',
    instagram: 'brominds.3d', // podes alterar se tiverem outro handle
    whatsapp: '351916175751', // Teu WhatsApp (Tiago) como principal de encomendas
  },

  /** Contactos individuais da equipa BroMinds */
  team: {
    tiago: {
      name: 'Tiago Costa',
      phone: '+351 916 175 751',
      rawPhone: '351916175751',
      role: 'Modelação & Produção 3D',
    },
    ines: {
      name: 'Inês Costa',
      phone: '+351 911 565 367',
      rawPhone: '351911565367',
      role: 'Atendimento & Encomendas',
    },
  },

  /** Informações de prazos, envios e pagamento */
  info: {
    prazo: '2 a 4 dias úteis para peças em catálogo',
    prazoPersonalizado: '3 a 5 dias úteis para projetos por medida',
    envio: 'Envio CTT / transportadora para todo o país e ilhas.',
    pagamento: 'MB WAY ou transferência bancária após confirmação da peça.',
  },
} as const

export const instagramUrl = `https://instagram.com/${site.contact.instagram}`
export const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`
export const emailUrl = `mailto:${site.contact.email}`

/**
 * Constroi o link de encomenda com texto ja pre-formatado para o WhatsApp ou Email.
 */
export function orderLink(options?: {
  productName?: string
  color?: string
  size?: string
  price?: number
}): string {
  const { productName, color, size, price } = options ?? {}

  const subject = productName
    ? `Encomenda: ${productName}`
    : `Pedido de Informação — ${site.name}`

  const body = productName
    ? `Olá BroMinds! Gostaria de encomendar a seguinte peça:\n\n` +
      `• Peça: ${productName}\n` +
      (size ? `• Tamanho: ${size}\n` : '') +
      (color ? `• Cor: ${color}\n` : '') +
      (price !== undefined ? `• Valor: ${price.toFixed(2)} €\n` : '') +
      `\nQuantidade: 1\nNome:\nMorada/Localidade:`
    : `Olá BroMinds! Gostaria de pedir informações sobre as vossas peças e impressões 3D.`

  switch (site.orderChannel) {
    case 'whatsapp':
      return `${whatsappUrl}?text=${encodeURIComponent(body)}`
    case 'instagram':
      return instagramUrl
    case 'email':
    default:
      return `${emailUrl}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`
  }
}

/** Rotulo amigavel do botao de encomenda */
export function orderChannelLabel(): string {
  switch (site.orderChannel) {
    case 'whatsapp':
      return 'Pedir por WhatsApp'
    case 'instagram':
      return 'Pedir por Instagram'
    case 'email':
    default:
      return 'Pedir por Email'
  }
}