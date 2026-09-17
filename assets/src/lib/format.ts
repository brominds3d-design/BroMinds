/** Formata um preco em euros com as convencoes de Portugal: 14,50 €. */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

/** Formata uma data ISO como "16 set 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}
