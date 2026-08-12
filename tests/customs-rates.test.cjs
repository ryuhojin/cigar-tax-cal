const assert = require('node:assert/strict');
const fs = require('node:fs');

const data = JSON.parse(fs.readFileSync('customs-rates.json', 'utf8'));
const requiredCurrencies = ['USD', 'EUR', 'CHF', 'HKD', 'GBP', 'CNY', 'JPY', 'AUD'];

assert.equal(data.rateType, 'import');
assert.match(data.weekStart, /^\d{4}-\d{2}-\d{2}$/);
assert.match(data.weekEnd, /^\d{4}-\d{2}-\d{2}$/);

const weekStart = new Date(`${data.weekStart}T00:00:00Z`);
const weekEnd = new Date(`${data.weekEnd}T00:00:00Z`);
assert.equal(weekStart.getUTCDay(), 0, 'weekStart must be Sunday');
assert.equal(weekEnd.getUTCDay(), 6, 'weekEnd must be Saturday');
assert.equal((weekEnd - weekStart) / 86400000, 6);

for (const currency of requiredCurrencies) {
  assert.ok(Number.isFinite(data.rates[currency]) && data.rates[currency] > 0, `invalid ${currency} rate`);
}

console.log('customs-rates tests passed');
