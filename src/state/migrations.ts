import type { UserState, UserProfile } from '../types'

export const CURRENT_VERSION = 2

export const defaultProfile: UserProfile = {
  displayName: undefined,
  membershipNumbers: {},
  notifications: {
    benefitExpiringDays: 7,
    cycleResetReminder: true,
    weeklyDigest: false,
  },
  display: {
    showExpiredBenefits: false,
  },
}

export function migrate(stored: Partial<UserState> & { version?: number }): UserState {
  let state = { ...stored } as UserState

  if (!state.version || state.version < 1) {
    state = {
      version: 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ownedCards: state.ownedCards ?? [],
      benefitSettings: state.benefitSettings ?? [],
      cycleInstances: state.cycleInstances ?? [],
      usageEntries: state.usageEntries ?? [],
      profile: defaultProfile,
    }
  }

  if (state.version < 2) {
    state = {
      ...state,
      version: 2,
      profile: (state as UserState & { profile?: UserProfile }).profile ?? defaultProfile,
    }
  }

  return state
}
