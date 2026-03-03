// ─── Seed Data Types ─────────────────────────────────────────────────────────

export type Cadence = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'cardmember'
export type CycleBoundary = 'calendar' | 'cardmember'
export type BenefitType = 'credit' | 'pass' | 'status' | 'info'
export type UnitType = 'usd' | 'passes' | null
export type BenefitStatus = 'unused' | 'partially_used' | 'used' | 'expired'

export interface CycleWindow {
  startMonth: number  // 1-indexed
  startDay: number
  endMonth: number
  endDay: number
}

export interface CycleRule {
  cycleRuleId: string
  cadence: Cadence
  boundary: CycleBoundary
  windows?: CycleWindow[]
}

export interface CardTheme {
  from: string    // CSS color for gradient start
  to: string      // CSS color for gradient end
  text: 'light' | 'dark'
  accent: string  // Hex color used for tabs, badges, buttons on this card
}

export interface CardDefinition {
  id: string
  display_name: string
  short_name: string
  issuer: string
  image_asset: string
  country: 'US'
  theme: CardTheme
}

export interface BenefitTemplate {
  benefitId: string
  cardId: string
  name: string
  type: BenefitType
  unitType: UnitType
  totalPerCycle: number | null
  currency: 'USD' | null
  cycleRuleId: string
  enrollmentRequired: boolean
  description: string
}

// ─── User Profile / Settings Types ───────────────────────────────────────────

export interface MembershipNumbers {
  tsaPrecheck?: string
  globalEntry?: string
  nexus?: string
  clear?: string
  priorityPass?: string
  centurion?: string
  admiralsClub?: string
  unitedClub?: string
  deltaSkyClub?: string
}

export interface NotificationPrefs {
  benefitExpiringDays: number  // alert N days before cycle ends; 0 = off
  cycleResetReminder: boolean
  weeklyDigest: boolean
}

export interface DisplayPrefs {
  showExpiredBenefits: boolean
}

export interface UserProfile {
  displayName?: string
  membershipNumbers: MembershipNumbers
  notifications: NotificationPrefs
  display: DisplayPrefs
}

// ─── User State Types ─────────────────────────────────────────────────────────

export interface UserCard {
  cardId: string
  enabled: boolean
  tabOrder: number
  nickname?: string
  anniversaryMonth?: number  // 1-indexed; required for cardmember cadence
}

export interface UserBenefitSettings {
  benefitId: string
  infoActivated?: boolean  // for info/status type perks
}

export interface CycleInstance {
  cycleInstanceId: string
  benefitId: string
  cycleStart: string  // ISO date string YYYY-MM-DD
  cycleEnd: string    // ISO date string YYYY-MM-DD
  status: BenefitStatus
}

export interface UsageEntry {
  usageEntryId: string
  cycleInstanceId: string
  amount?: number      // for credit type (USD)
  unitCount?: number   // for pass type
  createdAt: string    // ISO datetime
}

export interface UserState {
  version: number
  timezone: string
  ownedCards: UserCard[]
  benefitSettings: UserBenefitSettings[]
  cycleInstances: CycleInstance[]
  usageEntries: UsageEntry[]
  profile: UserProfile
}

// ─── Derived / UI Types ───────────────────────────────────────────────────────

export interface ResolvedBenefit {
  template: BenefitTemplate
  instance: CycleInstance
  usedAmount: number
  remaining: number | null  // null for info type
  status: BenefitStatus
  cycleStart: string
  cycleEnd: string
  infoActivated?: boolean
}
