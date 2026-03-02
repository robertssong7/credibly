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

export interface CardDefinition {
  id: string
  display_name: string
  short_name: string
  issuer: string
  image_asset: string
  country: 'US'
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

// ─── User State Types ─────────────────────────────────────────────────────────

export interface UserCard {
  cardId: string
  enabled: boolean
  tabOrder: number
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
