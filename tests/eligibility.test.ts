import assert from 'node:assert/strict'
import test from 'node:test'
import { getDentalCarrierForState } from '../src/types/index.ts'

test('routes ID, OR, and WA workers to Delta Dental', () => {
  for (const state of ['ID', 'OR', 'WA']) {
    assert.equal(getDentalCarrierForState(state), 'Delta Dental')
  }
})

test('routes all other configured states to Cigna', () => {
  for (const state of ['CA', 'AZ', 'CO', 'TX']) {
    assert.equal(getDentalCarrierForState(state), 'Cigna')
  }
})
