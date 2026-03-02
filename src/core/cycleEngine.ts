import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addYears,
  subYears,
  isBefore,
  isAfter,
} from 'date-fns'
import type { CycleRule, CycleInstance, BenefitTemplate } from '../types'

export interface CycleWindow {
  cycleStart: Date
  cycleEnd: Date
}

/**
 * Returns the start and end of the active cycle for a given rule and date.
 * All logic is date-only (no time component). Pure function.
 */
export function getActiveCycleWindow(
  rule: CycleRule,
  today: Date,
  anniversaryMonth?: number // 1-indexed
): CycleWindow {
  switch (rule.cadence) {
    case 'monthly':
      return {
        cycleStart: startOfMonth(today),
        cycleEnd: endOfMonth(today),
      }

    case 'quarterly': {
      const windows = rule.windows!
      for (const w of windows) {
        const start = new Date(today.getFullYear(), w.startMonth - 1, w.startDay)
        const end = new Date(today.getFullYear(), w.endMonth - 1, w.endDay)
        if (!isBefore(today, start) && !isAfter(today, end)) {
          return { cycleStart: start, cycleEnd: end }
        }
      }
      // Fallback: shouldn't reach here with well-formed data
      return {
        cycleStart: startOfYear(today),
        cycleEnd: endOfYear(today),
      }
    }

    case 'semiannual': {
      const windows = rule.windows!
      for (const w of windows) {
        const start = new Date(today.getFullYear(), w.startMonth - 1, w.startDay)
        const end = new Date(today.getFullYear(), w.endMonth - 1, w.endDay)
        if (!isBefore(today, start) && !isAfter(today, end)) {
          return { cycleStart: start, cycleEnd: end }
        }
      }
      return {
        cycleStart: startOfYear(today),
        cycleEnd: endOfYear(today),
      }
    }

    case 'annual':
      return {
        cycleStart: startOfYear(today),
        cycleEnd: endOfYear(today),
      }

    case 'cardmember': {
      const month = (anniversaryMonth ?? 1) - 1 // 0-indexed
      const thisYearStart = new Date(today.getFullYear(), month, 1)
      const nextYearStart = addYears(thisYearStart, 1)
      const lastYearStart = subYears(thisYearStart, 1)

      // Determine which window contains today
      if (!isBefore(today, thisYearStart) && isBefore(today, nextYearStart)) {
        return {
          cycleStart: thisYearStart,
          cycleEnd: new Date(nextYearStart.getTime() - 86400000), // day before next start
        }
      } else {
        // today is before this year's start, so we're in last year's window
        return {
          cycleStart: lastYearStart,
          cycleEnd: new Date(thisYearStart.getTime() - 86400000),
        }
      }
    }

    default:
      throw new Error(`Unknown cadence: ${(rule as CycleRule).cadence}`)
  }
}

/**
 * Format a Date as YYYY-MM-DD string (local date, no time zone conversion).
 */
export function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Parse a YYYY-MM-DD string to a local midnight Date.
 */
export function fromDateString(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Reconcile cycle instances for all active benefits.
 * - Creates a new CycleInstance for the current cycle if one doesn't exist.
 * - Marks past instances as 'expired' if they ended before today and are still 'unused'.
 * Returns the updated list of instances (new array, no mutation).
 */
export function reconcileCycles(
  templates: BenefitTemplate[],
  existingInstances: CycleInstance[],
  cycleRules: CycleRule[],
  today: Date,
  ownedCards: Array<{ cardId: string; enabled: boolean; anniversaryMonth?: number }>
): CycleInstance[] {
  const ruleMap = new Map<string, CycleRule>(cycleRules.map((r) => [r.cycleRuleId, r]))
  const updated = new Map<string, CycleInstance>(
    existingInstances.map((i) => [i.cycleInstanceId, { ...i }])
  )

  // Mark past instances as expired if they ended before today and are still unused
  for (const instance of updated.values()) {
    const end = fromDateString(instance.cycleEnd)
    if (
      isAfter(today, end) &&
      (instance.status === 'unused' || instance.status === 'partially_used')
    ) {
      updated.set(instance.cycleInstanceId, { ...instance, status: 'expired' })
    }
  }

  // For each enabled card × each benefit, ensure a current cycle instance exists
  for (const card of ownedCards) {
    if (!card.enabled) continue
    const cardTemplates = templates.filter((t) => t.cardId === card.cardId)

    for (const template of cardTemplates) {
      const rule = ruleMap.get(template.cycleRuleId)
      if (!rule) continue

      const window = getActiveCycleWindow(rule, today, card.anniversaryMonth)
      const cycleStartStr = toDateString(window.cycleStart)
      const cycleEndStr = toDateString(window.cycleEnd)

      // Check if a non-expired instance already exists for this benefit in this window
      const existing = [...updated.values()].find(
        (i) =>
          i.benefitId === template.benefitId &&
          i.cycleStart === cycleStartStr &&
          i.cycleEnd === cycleEndStr &&
          i.status !== 'expired'
      )

      if (!existing) {
        const newInstance: CycleInstance = {
          cycleInstanceId: generateId(),
          benefitId: template.benefitId,
          cycleStart: cycleStartStr,
          cycleEnd: cycleEndStr,
          status: 'unused',
        }
        updated.set(newInstance.cycleInstanceId, newInstance)
      }
    }
  }

  return Array.from(updated.values())
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

/**
 * Days remaining until cycle end (inclusive of end day).
 */
export function daysUntilCycleEnd(cycleEnd: string, today: Date): number {
  const end = fromDateString(cycleEnd)
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = end.getTime() - todayMidnight.getTime()
  return Math.max(0, Math.ceil(diff / 86400000))
}
