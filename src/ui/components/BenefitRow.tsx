import { useState } from 'react'
import type { ResolvedBenefitWithMeta } from '../../core/benefitResolver'
import { UsageModal } from './UsageModal'
import { formatCycleLabel, formatDaysRemaining, formatUSD } from '../../utils/dateUtils'
import type { BenefitStatus } from '../../types'

const statusConfig: Record<BenefitStatus, { label: string; classes: string }> = {
  unused: { label: 'Unused', classes: 'bg-gray-100 text-gray-600' },
  partially_used: { label: 'Partial', classes: 'bg-yellow-100 text-yellow-700' },
  used: { label: 'Used', classes: 'bg-green-100 text-green-700' },
  expired: { label: 'Expired', classes: 'bg-red-100 text-red-600' },
}

interface BenefitRowProps {
  benefit: ResolvedBenefitWithMeta
}

export function BenefitRow({ benefit }: BenefitRowProps) {
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const { template, status, remaining, daysRemaining, cycleStart, cycleEnd } = benefit
  const badge = statusConfig[status]
  const isUSD = template.unitType === 'usd'
  const isPass = template.unitType === 'passes'
  const isFullyUsed = status === 'used' || status === 'expired'

  const remainingLabel = (() => {
    if (remaining === null) return null
    if (isUSD) return formatUSD(remaining)
    if (isPass) return `${remaining} ${remaining === 1 ? 'pass' : 'passes'}`
    return null
  })()

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">{template.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.classes}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatCycleLabel(cycleStart, cycleEnd)}
              </p>
            </div>

            {/* Remaining amount */}
            {remainingLabel !== null && (
              <div className="text-right shrink-0">
                <span
                  className={`text-lg font-bold ${
                    remaining === 0 ? 'text-gray-400' : 'text-blue-600'
                  }`}
                >
                  {remainingLabel}
                </span>
                <p className="text-xs text-gray-400">{formatDaysRemaining(daysRemaining)}</p>
              </div>
            )}
          </div>

          {/* Progress bar for credit/pass types */}
          {template.totalPerCycle !== null && remaining !== null && (
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    ((template.totalPerCycle - remaining) / template.totalPerCycle) * 100
                  )}%`,
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {!isFullyUsed && template.totalPerCycle !== null && (
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 bg-blue-50 text-blue-600 rounded-lg py-1.5 text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                + Add Usage
              </button>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 bg-gray-50 text-gray-500 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              {expanded ? 'Less' : 'Details'}
            </button>
          </div>
        </div>

        {/* Expanded description */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3">
            <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
            {template.enrollmentRequired && (
              <p className="text-xs text-amber-600 mt-1.5 font-medium">
                Enrollment required to activate this benefit.
              </p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <UsageModal benefit={benefit} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
