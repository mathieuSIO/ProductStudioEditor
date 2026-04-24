const euroFormatter = new Intl.NumberFormat('fr-FR', {
  currency: 'EUR',
  style: 'currency',
})

export function formatEuro(value: number) {
  return euroFormatter.format(value)
}
