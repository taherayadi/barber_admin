export const CURRENCY = 'TND';

export function formatPrice(value: number): string {
  return `${value.toFixed(2)} ${CURRENCY}`;
}
