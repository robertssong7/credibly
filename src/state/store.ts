import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { UserState } from '../types'
import { reducer, type Action } from './reducers'
import { migrate, CURRENT_VERSION, defaultProfile } from './migrations'
import { reconcileCycles } from '../core/cycleEngine'
import cycleRulesData from '../data/cycleRules.json'
import benefitsData from '../data/benefits.json'
import type { CycleRule, BenefitTemplate } from '../types'

const STORAGE_KEY = 'credibly_user_state_v1'

const cycleRules = cycleRulesData as CycleRule[]
const benefits = benefitsData as BenefitTemplate[]

const defaultState: UserState = {
  version: CURRENT_VERSION,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  ownedCards: [],
  benefitSettings: [],
  cycleInstances: [],
  usageEntries: [],
  profile: defaultProfile,
}

function loadState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    return migrate(parsed)
  } catch {
    return defaultState
  }
}

function saveState(state: UserState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage quota exceeded or private browsing — fail silently
  }
}

interface StoreContextValue {
  state: UserState
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  // Persist on every state change
  useEffect(() => {
    saveState(state)
  }, [state])

  // Reconcile cycles on mount and whenever owned cards change
  useEffect(() => {
    const today = new Date()
    const updatedInstances = reconcileCycles(
      benefits,
      state.cycleInstances,
      cycleRules,
      today,
      state.ownedCards
    )
    // Only dispatch if instances actually changed
    const changed =
      updatedInstances.length !== state.cycleInstances.length ||
      updatedInstances.some((u, i) => {
        const existing = state.cycleInstances[i]
        return (
          !existing ||
          u.cycleInstanceId !== existing.cycleInstanceId ||
          u.status !== existing.status
        )
      })
    if (changed) {
      dispatch({ type: 'RECONCILE_CYCLES', updatedInstances })
    }
  }, [state.ownedCards]) // eslint-disable-line react-hooks/exhaustive-deps

  return React.createElement(StoreContext.Provider, { value: { state, dispatch } }, children)
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
