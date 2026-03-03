import { useState } from 'react'
import type { ResolvedBenefitWithMeta } from '../../core/benefitResolver'
import { useStore } from '../../state/store'

interface InfoPerkRowProps {
  benefit: ResolvedBenefitWithMeta
  accentColor?: string
}

export function InfoPerkRow({ benefit, accentColor = '#3B82F6' }: InfoPerkRowProps) {
  const { dispatch } = useStore()
  const [expanded, setExpanded] = useState(false)
  const { template, infoActivated } = benefit

  function handleToggle() {
    dispatch({
      type: 'TOGGLE_INFO_PERK',
      benefitId: template.benefitId,
      activated: !infoActivated,
    })
  }

  return (
    <div
      className="bg-white rounded-xl border shadow-sm overflow-hidden"
      style={{ borderColor: infoActivated ? `${accentColor}55` : '#F3F4F6' }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">{template.name}</span>
              {infoActivated && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                >
                  Activated ✓
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {template.type === 'status' ? 'Status perk' : 'Informational'}
            </p>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 bg-gray-50 text-gray-500 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            {expanded ? 'Less' : 'Details'}
          </button>
        </div>

        <div className="mt-3">
          <button
            onClick={handleToggle}
            className="w-full rounded-lg py-1.5 text-xs font-medium transition-colors"
            style={
              infoActivated
                ? { backgroundColor: `${accentColor}18`, color: accentColor }
                : { backgroundColor: '#F9FAFB', color: '#6B7280' }
            }
          >
            {infoActivated ? "I've activated this ✓" : 'Mark as activated'}
          </button>
        </div>
      </div>

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
  )
}
