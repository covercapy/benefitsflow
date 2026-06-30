import assert from 'node:assert/strict'
import test from 'node:test'
import { currentPayPeriod } from '../src/lib/pay-period.ts'

test('uses the first semimonthly period through the fifteenth', () => {
  assert.equal(currentPayPeriod(new Date(2026, 6, 15)), '2026-07-01/2026-07-15')
})

test('uses the calendar month end for the second period', () => {
  assert.equal(currentPayPeriod(new Date(2026, 1, 28)), '2026-02-16/2026-02-28')
})

test('handles leap-year February', () => {
  assert.equal(currentPayPeriod(new Date(2028, 1, 20)), '2028-02-16/2028-02-29')
})
