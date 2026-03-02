import type { BenefitTemplate, CycleInstance, UsageEntry, BenefitStatus } from '../types'

export interface UsageSummary {
  usedAmount: number
  usedUnits: number
  remaining: number | null  // null for info/status type
  status: BenefitStatus
}

/**
 * Compute aggregated usage for a single cycle instance.
 * Never stores derived totals — always recomputes from the ledger.
 */
export function computeUsage(
  template: BenefitTemplate,
  instance: CycleInstance,
  allEntries: UsageEntry[]
): UsageSummary {
  // Info/status types have no numeric tracking
  if (template.type === 'info' || template.type === 'status') {
    return {
      usedAmount: 0,
      usedUnits: 0,
      remaining: null,
      status: instance.status === 'expired' ? 'expired' : 'unused',
    }
  }

  const entries = allEntries.filter((e) => e.cycleInstanceId === instance.cycleInstanceId)

  const usedAmount = entries.reduce((sum, e) => sum + (e.amount ?? 0), 0)
  const usedUnits = entries.reduce((sum, e) => sum + (e.unitCount ?? 0), 0)

  const total = template.totalPerCycle

  let remaining: number | null = null
  if (total !== null) {
    if (template.unitType === 'usd') {
      remaining = Math.max(0, total - usedAmount)
    } else if (template.unitType === 'passes') {
      remaining = Math.max(0, total - usedUnits)
    }
  }

  const status = deriveStatus(template, usedAmount, usedUnits, instance.status)

  return { usedAmount, usedUnits, remaining, status }
}

/**
 * Derive benefit status from usage amounts.
 * Respects manually set 'used' or 'expired' on the instance.
 */
export function deriveStatus(
  template: BenefitTemplate,
  usedAmount: number,
  usedUnits: number,
  instanceStatus: BenefitStatus
): BenefitStatus {
  if (instanceStatus === 'expired') return 'expired'
  if (instanceStatus === 'used') return 'used'  // manually marked

  if (template.totalPerCycle === null) return 'unused'

  const used = template.unitType === 'passes' ? usedUnits : usedAmount
  const total = template.totalPerCycle

  if (used === 0) return 'unused'
  if (used >= total) return 'used'
  return 'partially_used'
}
