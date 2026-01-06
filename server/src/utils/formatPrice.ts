export function formatPrice(ore: number): string {
  return `${Math.round(ore / 100)} kr`;
}
