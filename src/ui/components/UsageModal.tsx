import { useState } from 'react'
import type { ResolvedBenefitWithMeta } from '../../core/benefitResolver'
import { useStore } from '../../state/store'
import { formatUSD } from '../../utils/dateUtils'

interface UsageModalProps {
  benefit: ResolvedBenefitWithMeta
  onClose: () => void
}

export function UsageModal({ benefit, onClose }: UsageModalProps) {
  const { dispatch } = useStore()
  const { template, instance, remaining } = benefit
  const isUSD = template.unitType === 'usd'
  const isPass = template.unitType === 'passes'

  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }
    if (remaining !== null && num > remaining) {
      setError(`Amount exceeds remaining balance (${isUSD ? formatUSD(remaining) : remaining})`)
      return
    }
    dispatch({
      type: 'LOG_USAGE',
      cycleInstanceId: instance.cycleInstanceId,
      amount: isUSD ? num : undefined,
      unitCount: isPass ? Math.round(num) : undefined,
    })
    onClose()
  }

  function handleMarkFullyUsed() {
    dispatch({ type: 'MARK_FULLY_USED', cycleInstanceId: instance.cycleInstanceId })
    onClose()
  }

  const remainingLabel =
    remaining !== null
      ? isUSD
        ? `${formatUSD(remaining)} remaining`
        : `${remaining} ${remaining === 1 ? 'pass' : 'passes'} remaining`
      : ''

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              {remainingLabel && (
                <p className="text-sm text-gray-500 mt-0.5">{remainingLabel}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {isUSD ? 'Amount used ($)' : 'Passes used'}
            </label>
            <input
              type="number"
              min="0"
              step={isUSD ? '0.01' : '1'}
              placeholder={isUSD ? '0.00' : '0'}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError('')
              }}
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white rounded-xl py-3 font-medium hover:bg-blue-600 transition-colors"
          >
            Log Usage
          </button>

          {template.totalPerCycle !== null && (
            <button
              onClick={handleMarkFullyUsed}
              className="w-full bg-gray-100 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-200 transition-colors"
            >
              Mark Fully Used
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
