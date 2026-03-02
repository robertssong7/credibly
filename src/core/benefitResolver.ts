import type {
  UserCard,
  BenefitTemplate,
  CycleInstance,
  UsageEntry,
  UserBenefitSettings,
  ResolvedBenefit,
} from '../types'
import { computeUsage } from './ledger'
import { daysUntilCycleEnd } from './cycleEngine'

export interface ResolvedBenefitWithMeta extends ResolvedBenefit {
  daysRemaining: number
}

/**
 * Resolves all active benefits for a given card into enriched rows ready for the UI.
 * No business logic should live outside this function and the engines it calls.
 */
export function resolveActiveBenefits(
  card: UserCard,
  templates: BenefitTemplate[],
  instances: CycleInstance[],
  entries: UsageEntry[],
  benefitSettings: UserBenefitSettings[],
  today: Date
): ResolvedBenefitWithMeta[] {
  const cardTemplates = templates.filter((t) => t.cardId === card.cardId)
  const results: ResolvedBenefitWithMeta[] = []

  for (const template of cardTemplates) {
    // Find the current (non-expired) instance for this benefit
    const instance = instances.find(
      (i) =>
        i.benefitId === template.benefitId &&
        i.status !== 'expired'
    )

    if (!instance) continue

    const summary = computeUsage(template, instance, entries)
    const settings = benefitSettings.find((s) => s.benefitId === template.benefitId)

    results.push({
      template,
      instance,
      usedAmount: summary.usedAmount,
      remaining: summary.remaining,
      status: summary.status,
      cycleStart: instance.cycleStart,
      cycleEnd: instance.cycleEnd,
      infoActivated: settings?.infoActivated,
      daysRemaining: daysUntilCycleEnd(instance.cycleEnd, today),
    })
  }

  // Sort: credits first, then passes, then status, then info
  const order: Record<string, number> = { credit: 0, pass: 1, status: 2, info: 3 }
  results.sort((a, b) => (order[a.template.type] ?? 9) - (order[b.template.type] ?? 9))

  return results
}
