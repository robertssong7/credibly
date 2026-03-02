import { useRef } from 'react'
import type { UserCard } from '../../types'
import cardsData from '../../data/cards.json'
import type { CardDefinition } from '../../types'
import { useStore } from '../../state/store'

const cardDefs = new Map((cardsData as CardDefinition[]).map((c) => [c.id, c]))

interface CardTabsProps {
  cards: UserCard[]
  activeCardId: string
  onSelect: (cardId: string) => void
}

export function CardTabs({ cards, activeCardId, onSelect }: CardTabsProps) {
  const { dispatch } = useStore()
  const sorted = [...cards].sort((a, b) => a.tabOrder - b.tabOrder)
  const dragCard = useRef<string | null>(null)

  function handleDragStart(cardId: string) {
    dragCard.current = cardId
  }

  function handleDrop(targetCardId: string) {
    if (!dragCard.current || dragCard.current === targetCardId) return
    const target = sorted.find((c) => c.cardId === targetCardId)
    if (!target) return
    dispatch({ type: 'REORDER_CARD', cardId: dragCard.current, newTabOrder: target.tabOrder })
    dragCard.current = null
  }

  return (
    <div className="flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-hide">
      {sorted.map((card) => {
        const def = cardDefs.get(card.cardId)
        const isActive = card.cardId === activeCardId
        return (
          <button
            key={card.cardId}
            draggable
            onDragStart={() => handleDragStart(card.cardId)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(card.cardId)}
            onClick={() => onSelect(card.cardId)}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {def?.short_name ?? card.cardId}
          </button>
        )
      })}
    </div>
  )
}
