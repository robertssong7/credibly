import { useRef, useState } from 'react'
import type { UserCard, CardDefinition } from '../../types'
import cardsData from '../../data/cards.json'
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

  const dragCardId = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  function handleDragStart(e: React.DragEvent, cardId: string) {
    dragCardId.current = cardId
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => setDragOverId(cardId), 0)
  }

  function handleDragOver(e: React.DragEvent, cardId: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragCardId.current !== cardId) setDragOverId(cardId)
  }

  function handleDrop(e: React.DragEvent, targetCardId: string) {
    e.preventDefault()
    if (!dragCardId.current || dragCardId.current === targetCardId) {
      setDragOverId(null)
      return
    }
    const target = sorted.find((c) => c.cardId === targetCardId)
    if (target) {
      dispatch({ type: 'REORDER_CARD', cardId: dragCardId.current, newTabOrder: target.tabOrder })
    }
    dragCardId.current = null
    setDragOverId(null)
  }

  function handleDragEnd() {
    dragCardId.current = null
    setDragOverId(null)
  }

  return (
    <div className="flex overflow-x-auto gap-1.5 px-4 pb-2 select-none" style={{ scrollbarWidth: 'none' }}>
      {sorted.map((card) => {
        const def = cardDefs.get(card.cardId)
        const isActive = card.cardId === activeCardId
        const isDraggingOver = dragOverId === card.cardId && dragCardId.current !== card.cardId
        const accentColor = def?.theme.accent ?? '#3B82F6'

        return (
          <div
            key={card.cardId}
            draggable
            onDragStart={(e) => handleDragStart(e, card.cardId)}
            onDragOver={(e) => handleDragOver(e, card.cardId)}
            onDrop={(e) => handleDrop(e, card.cardId)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(card.cardId)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 whitespace-nowrap ${
              isDraggingOver ? 'scale-105' : ''
            }`}
            style={
              isActive
                ? { backgroundColor: accentColor, color: '#fff', boxShadow: `0 2px 8px ${accentColor}55` }
                : { backgroundColor: '#F3F4F6', color: '#4B5563' }
            }
          >
            {/* Drag handle — always visible to hint reordering */}
            <span
              className={`text-sm leading-none cursor-grab active:cursor-grabbing ${
                isActive ? 'opacity-70' : 'opacity-35'
              }`}
              title="Drag to reorder"
            >
              ⠿
            </span>
            <span className="text-sm font-medium">
              {card.nickname || def?.short_name || card.cardId}
            </span>
          </div>
        )
      })}
    </div>
  )
}
