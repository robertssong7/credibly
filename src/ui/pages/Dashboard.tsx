import { useState } from 'react'
import { useStore } from '../../state/store'
import { CardTabs } from '../components/CardTabs'
import { BenefitRow } from '../components/BenefitRow'
import { InfoPerkRow } from '../components/InfoPerkRow'
import { CardSelector } from '../components/CardSelector'
import { resolveActiveBenefits } from '../../core/benefitResolver'
import benefitsData from '../../data/benefits.json'
import type { BenefitTemplate } from '../../types'

const allBenefits = benefitsData as BenefitTemplate[]

export function Dashboard() {
  const { state } = useStore()
  const [showSelector, setShowSelector] = useState(false)

  const sortedCards = [...state.ownedCards]
    .filter((c) => c.enabled)
    .sort((a, b) => a.tabOrder - b.tabOrder)

  const [activeCardId, setActiveCardId] = useState<string | null>(
    () => sortedCards[0]?.cardId ?? null
  )

  // When active card is removed, fall back to first card
  const effectiveActiveId =
    activeCardId && sortedCards.find((c) => c.cardId === activeCardId)
      ? activeCardId
      : sortedCards[0]?.cardId ?? null

  const activeCard = sortedCards.find((c) => c.cardId === effectiveActiveId)

  const resolvedBenefits = activeCard
    ? resolveActiveBenefits(
        activeCard,
        allBenefits,
        state.cycleInstances,
        state.usageEntries,
        state.benefitSettings,
        new Date()
      )
    : []

  const creditAndPassBenefits = resolvedBenefits.filter(
    (b) => b.template.type === 'credit' || b.template.type === 'pass'
  )
  const infoAndStatusBenefits = resolvedBenefits.filter(
    (b) => b.template.type === 'info' || b.template.type === 'status'
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Credibly</h1>
          <button
            onClick={() => setShowSelector(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Manage Cards
          </button>
        </div>
      </header>

      {sortedCards.length === 0 ? (
        // Empty state
        <div className="max-w-2xl mx-auto px-4 pt-20 text-center">
          <div className="text-5xl mb-4">💳</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No cards yet</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Add your premium credit cards to start tracking your benefits.
          </p>
          <button
            onClick={() => setShowSelector(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Add Your First Card
          </button>
        </div>
      ) : (
        <>
          {/* Card tabs */}
          <div className="bg-white border-b border-gray-100 pt-3">
            <div className="max-w-2xl mx-auto">
              <CardTabs
                cards={sortedCards}
                activeCardId={effectiveActiveId ?? ''}
                onSelect={setActiveCardId}
              />
            </div>
          </div>

          {/* Benefits list */}
          <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {creditAndPassBenefits.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Credits & Passes
                </h2>
                <div className="space-y-3">
                  {creditAndPassBenefits.map((b) => (
                    <BenefitRow key={b.instance.cycleInstanceId} benefit={b} />
                  ))}
                </div>
              </section>
            )}

            {infoAndStatusBenefits.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Perks & Status
                </h2>
                <div className="space-y-3">
                  {infoAndStatusBenefits.map((b) => (
                    <InfoPerkRow key={b.instance.cycleInstanceId} benefit={b} />
                  ))}
                </div>
              </section>
            )}

            {resolvedBenefits.length === 0 && activeCard && (
              <p className="text-center text-gray-400 text-sm pt-8">
                No benefits loaded for this card yet.
              </p>
            )}
          </main>
        </>
      )}

      {showSelector && <CardSelector onClose={() => setShowSelector(false)} />}
    </div>
  )
}
