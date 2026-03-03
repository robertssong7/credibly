import type {
  UserState,
  UserCard,
  UsageEntry,
  CycleInstance,
  MembershipNumbers,
  NotificationPrefs,
  DisplayPrefs,
} from '../types'

export type Action =
  | { type: 'ADD_CARD'; cardId: string; anniversaryMonth?: number }
  | { type: 'REMOVE_CARD'; cardId: string }
  | { type: 'REORDER_CARD'; cardId: string; newTabOrder: number }
  | { type: 'SET_CARD_NICKNAME'; cardId: string; nickname: string }
  | { type: 'SET_ANNIVERSARY_MONTH'; cardId: string; anniversaryMonth: number }
  | { type: 'LOG_USAGE'; cycleInstanceId: string; amount?: number; unitCount?: number }
  | { type: 'MARK_FULLY_USED'; cycleInstanceId: string }
  | { type: 'TOGGLE_INFO_PERK'; benefitId: string; activated: boolean }
  | { type: 'SET_TIMEZONE'; timezone: string }
  | { type: 'SET_DISPLAY_NAME'; name: string }
  | { type: 'SET_MEMBERSHIP_NUMBERS'; numbers: MembershipNumbers }
  | { type: 'SET_NOTIFICATION_PREFS'; prefs: NotificationPrefs }
  | { type: 'SET_DISPLAY_PREFS'; prefs: DisplayPrefs }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'RECONCILE_CYCLES'; updatedInstances: CycleInstance[] }

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function reducer(state: UserState, action: Action): UserState {
  switch (action.type) {
    case 'ADD_CARD': {
      if (state.ownedCards.find((c) => c.cardId === action.cardId)) return state
      const maxOrder = state.ownedCards.reduce((m, c) => Math.max(m, c.tabOrder), -1)
      const newCard: UserCard = {
        cardId: action.cardId,
        enabled: true,
        tabOrder: maxOrder + 1,
        anniversaryMonth: action.anniversaryMonth,
      }
      return { ...state, ownedCards: [...state.ownedCards, newCard] }
    }

    case 'REMOVE_CARD': {
      const updated = state.ownedCards
        .filter((c) => c.cardId !== action.cardId)
        .map((c, i) => ({ ...c, tabOrder: i }))
      return { ...state, ownedCards: updated }
    }

    case 'REORDER_CARD': {
      const cards = [...state.ownedCards].sort((a, b) => a.tabOrder - b.tabOrder)
      const moving = cards.find((c) => c.cardId === action.cardId)
      if (!moving) return state
      const without = cards.filter((c) => c.cardId !== action.cardId)
      without.splice(action.newTabOrder, 0, moving)
      const reindexed = without.map((c, i) => ({ ...c, tabOrder: i }))
      return { ...state, ownedCards: reindexed }
    }

    case 'SET_CARD_NICKNAME': {
      const cards = state.ownedCards.map((c) =>
        c.cardId === action.cardId ? { ...c, nickname: action.nickname } : c
      )
      return { ...state, ownedCards: cards }
    }

    case 'SET_ANNIVERSARY_MONTH': {
      const cards = state.ownedCards.map((c) =>
        c.cardId === action.cardId ? { ...c, anniversaryMonth: action.anniversaryMonth } : c
      )
      return { ...state, ownedCards: cards }
    }

    case 'LOG_USAGE': {
      const entry: UsageEntry = {
        usageEntryId: generateId(),
        cycleInstanceId: action.cycleInstanceId,
        amount: action.amount,
        unitCount: action.unitCount,
        createdAt: new Date().toISOString(),
      }
      return { ...state, usageEntries: [...state.usageEntries, entry] }
    }

    case 'MARK_FULLY_USED': {
      const instances = state.cycleInstances.map((i) =>
        i.cycleInstanceId === action.cycleInstanceId ? { ...i, status: 'used' as const } : i
      )
      return { ...state, cycleInstances: instances }
    }

    case 'TOGGLE_INFO_PERK': {
      const existing = state.benefitSettings.find((s) => s.benefitId === action.benefitId)
      if (existing) {
        const updated = state.benefitSettings.map((s) =>
          s.benefitId === action.benefitId ? { ...s, infoActivated: action.activated } : s
        )
        return { ...state, benefitSettings: updated }
      }
      return {
        ...state,
        benefitSettings: [
          ...state.benefitSettings,
          { benefitId: action.benefitId, infoActivated: action.activated },
        ],
      }
    }

    case 'SET_TIMEZONE':
      return { ...state, timezone: action.timezone }

    case 'SET_DISPLAY_NAME':
      return { ...state, profile: { ...state.profile, displayName: action.name } }

    case 'SET_MEMBERSHIP_NUMBERS':
      return {
        ...state,
        profile: { ...state.profile, membershipNumbers: action.numbers },
      }

    case 'SET_NOTIFICATION_PREFS':
      return {
        ...state,
        profile: { ...state.profile, notifications: action.prefs },
      }

    case 'SET_DISPLAY_PREFS':
      return {
        ...state,
        profile: { ...state.profile, display: action.prefs },
      }

    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        ownedCards: [],
        benefitSettings: [],
        cycleInstances: [],
        usageEntries: [],
      }

    case 'RECONCILE_CYCLES':
      return { ...state, cycleInstances: action.updatedInstances }

    default:
      return state
  }
}
