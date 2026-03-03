import { useState } from 'react'
import { useStore } from '../../state/store'
import type { MembershipNumbers, NotificationPrefs } from '../../types'
import cardsData from '../../data/cards.json'
import type { CardDefinition } from '../../types'

const allCards = cardsData as CardDefinition[]

interface SettingsPageProps {
  onClose: () => void
}

type Section = 'profile' | 'memberships' | 'cards' | 'notifications' | 'data'

export function SettingsPage({ onClose }: SettingsPageProps) {
  useStore() // ensure context is available to children
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [saved, setSaved] = useState(false)

  function flashSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const sections: { id: Section; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'memberships', label: 'Membership Numbers', icon: '🎫' },
    { id: 'cards', label: 'Card Settings', icon: '💳' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'data', label: 'Data & Privacy', icon: '🗂️' },
  ]

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Settings</h1>
        {saved && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
      </header>

      <div className="flex flex-1 overflow-hidden max-w-2xl mx-auto w-full">
        {/* Sidebar nav */}
        <nav className="w-40 shrink-0 border-r border-gray-100 bg-white py-4 overflow-y-auto">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${
                activeSection === s.id
                  ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{s.icon}</span>
              <span className="leading-tight">{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Section content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'profile' && (
            <ProfileSection onSave={flashSaved} />
          )}
          {activeSection === 'memberships' && (
            <MembershipsSection onSave={flashSaved} />
          )}
          {activeSection === 'cards' && (
            <CardSettingsSection cards={allCards} onSave={flashSaved} />
          )}
          {activeSection === 'notifications' && (
            <NotificationsSection onSave={flashSaved} />
          )}
          {activeSection === 'data' && (
            <DataSection />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfileSection({ onSave }: { onSave: () => void }) {
  const { state, dispatch } = useStore()
  const [name, setName] = useState(state.profile.displayName ?? '')
  const [tz, setTz] = useState(state.timezone)

  function save() {
    dispatch({ type: 'SET_DISPLAY_NAME', name })
    dispatch({ type: 'SET_TIMEZONE', timezone: tz })
    onSave()
  }

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-gray-900">Profile</h2>

      <Field label="Display Name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="input"
        />
      </Field>

      <Field label="Timezone" hint="Used for cycle boundary calculations">
        <select value={tz} onChange={(e) => setTz(e.target.value)} className="input">
          {timezones.map((t) => (
            <option key={t} value={t}>{t.replace('America/', '').replace('_', ' ')}</option>
          ))}
        </select>
      </Field>

      <SaveButton onClick={save} />
    </div>
  )
}

// ─── Membership Numbers ───────────────────────────────────────────────────────

function MembershipsSection({ onSave }: { onSave: () => void }) {
  const { state, dispatch } = useStore()
  const [nums, setNums] = useState<MembershipNumbers>({ ...state.profile.membershipNumbers })

  function set(key: keyof MembershipNumbers, val: string) {
    setNums((prev) => ({ ...prev, [key]: val || undefined }))
  }

  function save() {
    dispatch({ type: 'SET_MEMBERSHIP_NUMBERS', numbers: nums })
    onSave()
  }

  const travelFields: { key: keyof MembershipNumbers; label: string; placeholder: string }[] = [
    { key: 'tsaPrecheck', label: 'TSA PreCheck Known Traveler Number', placeholder: '9-digit KTN' },
    { key: 'globalEntry', label: 'Global Entry / PASSID', placeholder: '9-digit PASSID' },
    { key: 'nexus', label: 'NEXUS PASSID', placeholder: 'NEXUS card number' },
    { key: 'clear', label: 'CLEAR Member Number', placeholder: 'CLEAR ID' },
    { key: 'priorityPass', label: 'Priority Pass Card Number', placeholder: 'PP-XXXXXXXXXX' },
  ]

  const loungeFields: { key: keyof MembershipNumbers; label: string; placeholder: string }[] = [
    { key: 'centurion', label: 'Amex Centurion / Platinum Card #', placeholder: 'Last 4 or member ID' },
    { key: 'admiralsClub', label: 'Admirals Club Membership #', placeholder: 'AC member number' },
    { key: 'unitedClub', label: 'United Club Card #', placeholder: 'UC card number' },
    { key: 'deltaSkyClub', label: 'Delta Sky Club Membership #', placeholder: 'Sky Club ID' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-gray-900">Travel Identity</h2>
      <p className="text-xs text-gray-400">Stored locally only. Never sent anywhere.</p>

      <div className="space-y-4">
        {travelFields.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <input
              type="text"
              value={nums[key] ?? ''}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              className="input font-mono"
            />
          </Field>
        ))}
      </div>

      <h2 className="text-base font-bold text-gray-900 pt-2">Lounge Memberships</h2>
      <div className="space-y-4">
        {loungeFields.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <input
              type="text"
              value={nums[key] ?? ''}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              className="input font-mono"
            />
          </Field>
        ))}
      </div>

      <SaveButton onClick={save} />
    </div>
  )
}

// ─── Card Settings ────────────────────────────────────────────────────────────

function CardSettingsSection({
  cards,
  onSave,
}: {
  cards: CardDefinition[]
  onSave: () => void
}) {
  const { state } = useStore()
  const ownedCards = state.ownedCards

  if (ownedCards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No cards added yet. Add cards from the main screen.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-gray-900">Card Settings</h2>
      <div className="space-y-5">
        {ownedCards
          .sort((a, b) => a.tabOrder - b.tabOrder)
          .map((userCard) => {
            const def = cards.find((c) => c.id === userCard.cardId)
            if (!def) return null

            return (
              <CardSettingRow
                key={userCard.cardId}
                userCard={userCard}
                def={def}
                onSave={onSave}
              />
            )
          })}
      </div>
    </div>
  )
}

function CardSettingRow({
  userCard,
  def,
  onSave,
}: {
  userCard: import('../../types').UserCard
  def: CardDefinition
  onSave: () => void
}) {
  const { dispatch } = useStore()
  const [nickname, setNickname] = useState(userCard.nickname ?? '')
  const [anniversaryMonth, setAnniversaryMonth] = useState(
    String(userCard.anniversaryMonth ?? '')
  )

  function save() {
    if (nickname !== (userCard.nickname ?? '')) {
      dispatch({ type: 'SET_CARD_NICKNAME', cardId: userCard.cardId, nickname })
    }
    const month = parseInt(anniversaryMonth, 10)
    if (!isNaN(month) && month >= 1 && month <= 12) {
      dispatch({ type: 'SET_ANNIVERSARY_MONTH', cardId: userCard.cardId, anniversaryMonth: month })
    }
    onSave()
  }

  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: def.theme.accent }} />
        <p className="text-sm font-semibold text-gray-800">{def.short_name}</p>
      </div>

      <Field label="Nickname (optional)">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={def.short_name}
          className="input"
        />
      </Field>

      <Field label="Card anniversary month" hint="Month your card opened (for cardmember-year benefits)">
        <input
          type="number"
          min={1}
          max={12}
          value={anniversaryMonth}
          onChange={(e) => setAnniversaryMonth(e.target.value)}
          placeholder="1–12"
          className="input w-24"
        />
      </Field>

      <button
        onClick={save}
        className="text-sm text-blue-600 font-medium hover:text-blue-700"
      >
        Save
      </button>
    </div>
  )
}

// ─── Notifications ────────────────────────────────────────────────────────────

function NotificationsSection({ onSave }: { onSave: () => void }) {
  const { state, dispatch } = useStore()
  const [prefs, setPrefs] = useState<NotificationPrefs>({ ...state.profile.notifications })

  function save() {
    dispatch({ type: 'SET_NOTIFICATION_PREFS', prefs })
    onSave()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-gray-900">Notifications</h2>
      <p className="text-xs text-gray-400">
        Notification delivery is not yet implemented — these preferences are saved for when it is.
      </p>

      <div className="space-y-4">
        <Toggle
          label="Cycle Reset Reminder"
          hint="Remind me when a benefit cycle is about to reset"
          checked={prefs.cycleResetReminder}
          onChange={(v) => setPrefs((p) => ({ ...p, cycleResetReminder: v }))}
        />

        <Toggle
          label="Weekly Benefit Digest"
          hint="Weekly summary of remaining credits and upcoming resets"
          checked={prefs.weeklyDigest}
          onChange={(v) => setPrefs((p) => ({ ...p, weeklyDigest: v }))}
        />

        <Field
          label="Expiring Benefit Alert"
          hint="Alert me this many days before a benefit cycle ends (0 = off)"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={30}
              value={prefs.benefitExpiringDays}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, benefitExpiringDays: parseInt(e.target.value) || 0 }))
              }
              className="input w-24"
            />
            <span className="text-sm text-gray-500">days before</span>
          </div>
        </Field>
      </div>

      <SaveButton onClick={save} />
    </div>
  )
}

// ─── Data & Privacy ───────────────────────────────────────────────────────────

function DataSection() {
  const { state, dispatch } = useStore()
  const [confirmClear, setConfirmClear] = useState(false)

  function exportData() {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `credibly-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearData() {
    dispatch({ type: 'CLEAR_ALL_DATA' })
    setConfirmClear(false)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-gray-900">Data & Privacy</h2>
      <p className="text-xs text-gray-400">
        All data is stored only on this device in your browser's localStorage. Nothing is sent to any server.
      </p>

      <div className="space-y-3">
        <DataActionRow
          title="Export Data"
          description="Download a JSON backup of all your cards, usage history, and settings."
          buttonLabel="Export JSON"
          buttonStyle="secondary"
          onClick={exportData}
        />

        <DataActionRow
          title="Clear All Card Data"
          description="Removes all owned cards and usage history. Settings and profile are kept."
          buttonLabel={confirmClear ? 'Tap again to confirm' : 'Clear Cards & Usage'}
          buttonStyle="danger"
          onClick={() => {
            if (confirmClear) clearData()
            else setConfirmClear(true)
          }}
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400">
          Credibly is open source. Benefit data is sourced from card issuer pages and may be
          outdated. Always verify benefits with your card issuer.
        </p>
      </div>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-10 h-6 rounded-full transition-colors relative ${
          checked ? 'bg-blue-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  )
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-500 text-white rounded-xl py-3 font-medium hover:bg-blue-600 transition-colors"
    >
      Save Changes
    </button>
  )
}

function DataActionRow({
  title,
  description,
  buttonLabel,
  buttonStyle,
  onClick,
}: {
  title: string
  description: string
  buttonLabel: string
  buttonStyle: 'secondary' | 'danger'
  onClick: () => void
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={`shrink-0 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
          buttonStyle === 'danger'
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
