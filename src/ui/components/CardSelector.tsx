import { useState } from 'react'
import cardsData from '../../data/cards.json'
import type { CardDefinition } from '../../types'
import { useStore } from '../../state/store'

const allCards = cardsData as CardDefinition[]

export function CardSelector({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore()
  const ownedIds = new Set(state.ownedCards.map((c) => c.cardId))
  const [anniversaryInputs, setAnniversaryInputs] = useState<Record<string, string>>({})

  function handleToggle(cardId: string) {
    if (ownedIds.has(cardId)) {
      dispatch({ type: 'REMOVE_CARD', cardId })
    } else {
      const month = parseInt(anniversaryInputs[cardId] ?? '1', 10)
      dispatch({
        type: 'ADD_CARD',
        cardId,
        anniversaryMonth: isNaN(month) || month < 1 || month > 12 ? 1 : month,
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">My Cards</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {allCards.map((card) => {
            const isOwned = ownedIds.has(card.id)
            return (
              <div
                key={card.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isOwned
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {card.display_name}
                    </p>
                    <p className="text-xs text-gray-500">{card.issuer}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(card.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isOwned
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isOwned ? 'Remove' : 'Add'}
                  </button>
                </div>

                {/* Anniversary month input for cardmember-cycle benefits */}
                {!isOwned && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs text-gray-500">Card anniversary month:</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      placeholder="1–12"
                      value={anniversaryInputs[card.id] ?? ''}
                      onChange={(e) =>
                        setAnniversaryInputs((prev) => ({ ...prev, [card.id]: e.target.value }))
                      }
                      className="w-16 text-xs border border-gray-200 rounded px-2 py-1 text-center"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white rounded-xl py-3 font-medium hover:bg-blue-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
