import type { CardDefinition } from '../../types'

interface CardArtProps {
  card: CardDefinition
  nickname?: string
}

export function CardArt({ card, nickname }: CardArtProps) {
  const { theme } = card
  const isLight = theme.text === 'light'
  const textClass = isLight ? 'text-white' : 'text-gray-800'
  const subtextClass = isLight ? 'text-white/70' : 'text-gray-500'

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
        aspectRatio: '85.6 / 53.98', // standard credit card ratio
      }}
    >
      {/* Shine overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      {/* Card content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        {/* Top row: issuer */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold tracking-widest uppercase ${subtextClass}`}>
            {card.issuer}
          </span>
          {/* Chip */}
          <div
            className="w-8 h-6 rounded-sm opacity-80"
            style={{
              background: isLight
                ? 'linear-gradient(135deg, #e2c35a, #c9a227)'
                : 'linear-gradient(135deg, #888, #555)',
            }}
          />
        </div>

        {/* Bottom row: card name */}
        <div>
          <p className={`text-xs font-medium ${subtextClass} mb-0.5`}>
            {nickname || card.short_name}
          </p>
          <p className={`text-sm font-bold leading-tight ${textClass}`}>
            {card.display_name}
          </p>
        </div>
      </div>

      {/* Decorative circles */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: isLight ? '#fff' : '#000' }}
      />
      <div
        className="absolute -right-4 -bottom-10 w-40 h-40 rounded-full opacity-10"
        style={{ background: isLight ? '#fff' : '#000' }}
      />
    </div>
  )
}
