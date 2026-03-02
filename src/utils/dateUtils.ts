import { format } from 'date-fns'

/**
 * Format a YYYY-MM-DD date string to a human-readable label like "Jan 1 – Mar 31".
 */
export function formatCycleLabel(cycleStart: string, cycleEnd: string): string {
  const start = parseLocalDate(cycleStart)
  const end = parseLocalDate(cycleEnd)
  const startStr = format(start, 'MMM d')
  const endStr = format(end, 'MMM d')
  // If same year, only show year at end
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()
  if (startYear === endYear) {
    return `${startStr} – ${endStr}, ${endYear}`
  }
  return `${startStr}, ${startYear} – ${endStr}, ${endYear}`
}

/**
 * Parse a YYYY-MM-DD string as a local date (avoids UTC shift issues).
 */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Format days remaining as a short human string.
 */
export function formatDaysRemaining(days: number): string {
  if (days === 0) return 'Expires today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

/**
 * Format a dollar amount with $ prefix and 2 decimal places if needed.
 */
export function formatUSD(amount: number): string {
  if (amount % 1 === 0) return `$${amount}`
  return `$${amount.toFixed(2)}`
}
