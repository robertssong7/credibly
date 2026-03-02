import type { UserState } from '../types'

export const CURRENT_VERSION = 1

/**
 * Apply incremental migrations to bring stored state up to current version.
 * Never mutates the input — always returns a new object.
 */
export function migrate(stored: Partial<UserState> & { version?: number }): UserState {
  let state = { ...stored } as UserState

  // v0 → v1: initial schema (no prior version existed)
  if (!state.version || state.version < 1) {
    state = {
      version: 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ownedCards: state.ownedCards ?? [],
      benefitSettings: state.benefitSettings ?? [],
      cycleInstances: state.cycleInstances ?? [],
      usageEntries: state.usageEntries ?? [],
    }
  }

  // Future migrations go here:
  // if (state.version < 2) { ... state.version = 2 }

  return state
}
