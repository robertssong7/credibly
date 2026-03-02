import { describe, it, expect } from 'vitest'
import {
  getActiveCycleWindow,
  toDateString,
  daysUntilCycleEnd,
} from '../cycleEngine'
import type { CycleRule } from '../../types'

const monthly: CycleRule = { cycleRuleId: 'monthly-calendar', cadence: 'monthly', boundary: 'calendar' }

const quarterly: CycleRule = {
  cycleRuleId: 'quarterly-calendar',
  cadence: 'quarterly',
  boundary: 'calendar',
  windows: [
    { startMonth: 1, startDay: 1, endMonth: 3, endDay: 31 },
    { startMonth: 4, startDay: 1, endMonth: 6, endDay: 30 },
    { startMonth: 7, startDay: 1, endMonth: 9, endDay: 30 },
    { startMonth: 10, startDay: 1, endMonth: 12, endDay: 31 },
  ],
}

const semiannual: CycleRule = {
  cycleRuleId: 'semiannual-calendar',
  cadence: 'semiannual',
  boundary: 'calendar',
  windows: [
    { startMonth: 1, startDay: 1, endMonth: 6, endDay: 30 },
    { startMonth: 7, startDay: 1, endMonth: 12, endDay: 31 },
  ],
}

const annual: CycleRule = {
  cycleRuleId: 'annual-calendar',
  cadence: 'annual',
  boundary: 'calendar',
  windows: [{ startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 }],
}

const cardmember: CycleRule = {
  cycleRuleId: 'annual-cardmember',
  cadence: 'cardmember',
  boundary: 'cardmember',
}

describe('getActiveCycleWindow - monthly', () => {
  it('returns first day of month to last day of month', () => {
    const today = new Date(2024, 2, 15) // March 15
    const w = getActiveCycleWindow(monthly, today)
    expect(toDateString(w.cycleStart)).toBe('2024-03-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-03-31')
  })

  it('handles February in a non-leap year', () => {
    const today = new Date(2023, 1, 14) // Feb 14 2023
    const w = getActiveCycleWindow(monthly, today)
    expect(toDateString(w.cycleStart)).toBe('2023-02-01')
    expect(toDateString(w.cycleEnd)).toBe('2023-02-28')
  })

  it('handles February in a leap year', () => {
    const today = new Date(2024, 1, 14) // Feb 14 2024
    const w = getActiveCycleWindow(monthly, today)
    expect(toDateString(w.cycleStart)).toBe('2024-02-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-02-29')
  })

  it('handles first day of month', () => {
    const today = new Date(2024, 0, 1) // Jan 1
    const w = getActiveCycleWindow(monthly, today)
    expect(toDateString(w.cycleStart)).toBe('2024-01-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-01-31')
  })

  it('handles last day of month', () => {
    const today = new Date(2024, 2, 31) // Mar 31
    const w = getActiveCycleWindow(monthly, today)
    expect(toDateString(w.cycleStart)).toBe('2024-03-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-03-31')
  })
})

describe('getActiveCycleWindow - quarterly', () => {
  it('Q1: March 31', () => {
    const w = getActiveCycleWindow(quarterly, new Date(2024, 2, 31))
    expect(toDateString(w.cycleStart)).toBe('2024-01-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-03-31')
  })

  it('Q2: April 1 (day after Q1 ends)', () => {
    const w = getActiveCycleWindow(quarterly, new Date(2024, 3, 1))
    expect(toDateString(w.cycleStart)).toBe('2024-04-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-06-30')
  })

  it('Q3: July 1', () => {
    const w = getActiveCycleWindow(quarterly, new Date(2024, 6, 1))
    expect(toDateString(w.cycleStart)).toBe('2024-07-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-09-30')
  })

  it('Q4: December 31', () => {
    const w = getActiveCycleWindow(quarterly, new Date(2024, 11, 31))
    expect(toDateString(w.cycleStart)).toBe('2024-10-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-12-31')
  })
})

describe('getActiveCycleWindow - semiannual', () => {
  it('H1: January 1', () => {
    const w = getActiveCycleWindow(semiannual, new Date(2024, 0, 1))
    expect(toDateString(w.cycleStart)).toBe('2024-01-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-06-30')
  })

  it('H1: June 30', () => {
    const w = getActiveCycleWindow(semiannual, new Date(2024, 5, 30))
    expect(toDateString(w.cycleStart)).toBe('2024-01-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-06-30')
  })

  it('H2: July 1 (day after H1 ends)', () => {
    const w = getActiveCycleWindow(semiannual, new Date(2024, 6, 1))
    expect(toDateString(w.cycleStart)).toBe('2024-07-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-12-31')
  })

  it('H2: December 31', () => {
    const w = getActiveCycleWindow(semiannual, new Date(2024, 11, 31))
    expect(toDateString(w.cycleStart)).toBe('2024-07-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-12-31')
  })
})

describe('getActiveCycleWindow - annual calendar', () => {
  it('returns full calendar year', () => {
    const w = getActiveCycleWindow(annual, new Date(2024, 5, 15))
    expect(toDateString(w.cycleStart)).toBe('2024-01-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-12-31')
  })

  it('Jan 1 is start', () => {
    const w = getActiveCycleWindow(annual, new Date(2024, 0, 1))
    expect(toDateString(w.cycleStart)).toBe('2024-01-01')
  })

  it('Dec 31 is end', () => {
    const w = getActiveCycleWindow(annual, new Date(2024, 11, 31))
    expect(toDateString(w.cycleEnd)).toBe('2024-12-31')
  })
})

describe('getActiveCycleWindow - cardmember annual', () => {
  it('returns correct window mid-year when anniversary is January', () => {
    const w = getActiveCycleWindow(cardmember, new Date(2024, 5, 15), 1)
    expect(toDateString(w.cycleStart)).toBe('2024-01-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-12-31')
  })

  it('today before anniversary is in previous window', () => {
    // Anniversary is June (month 6); today is March → still in previous window (Jun 2023 – May 2024)
    const w = getActiveCycleWindow(cardmember, new Date(2024, 2, 15), 6)
    expect(toDateString(w.cycleStart)).toBe('2023-06-01')
    expect(toDateString(w.cycleEnd)).toBe('2024-05-31')
  })

  it('today on anniversary day starts new window', () => {
    // Anniversary June; today is June 1 2024 → new window starts
    const w = getActiveCycleWindow(cardmember, new Date(2024, 5, 1), 6)
    expect(toDateString(w.cycleStart)).toBe('2024-06-01')
    expect(toDateString(w.cycleEnd)).toBe('2025-05-31')
  })

  it('handles December anniversary with rollover', () => {
    // Anniversary Dec; today is Jan 5 2025 → window is Dec 2024 – Nov 2025
    const w = getActiveCycleWindow(cardmember, new Date(2025, 0, 5), 12)
    expect(toDateString(w.cycleStart)).toBe('2024-12-01')
    expect(toDateString(w.cycleEnd)).toBe('2025-11-30')
  })
})

describe('daysUntilCycleEnd', () => {
  it('returns 0 when today is the end day', () => {
    expect(daysUntilCycleEnd('2024-03-31', new Date(2024, 2, 31))).toBe(0)
  })

  it('returns 1 when end is tomorrow', () => {
    expect(daysUntilCycleEnd('2024-03-31', new Date(2024, 2, 30))).toBe(1)
  })

  it('returns 30 when end is 30 days away', () => {
    expect(daysUntilCycleEnd('2024-04-30', new Date(2024, 2, 31))).toBe(30)
  })
})
