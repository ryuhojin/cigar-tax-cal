const assert = require('node:assert/strict');
const { calculate } = require('../tax-policy.js');

const baseRates = {
  currency: 'USD',
  paymentRate: 1450,
  customsSelectedRate: 1427.06,
  customsUsdRate: 1427.06
};

function closeTo(actual, expected, epsilon = 0.0001) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} was not close to ${expected}`);
}

{
  const result = calculate({
    weight: 150,
    goodsAmount: 150,
    koreaShipping: 20,
    isOver50: false
  }, baseRates);

  assert.equal(result.isOverUsdThreshold, false);
  assert.equal(result.dutyTax, 0);
  assert.equal(result.vatTax, 0);
  assert.equal(result.indivTax, 0);
  closeTo(result.localTax, 22246.455);
  assert.equal(result.goodsPurchaseKrw, 217500);
  assert.equal(result.shippingPurchaseKrw, 29000);
  assert.equal(result.purchaseKrw, 246500);
}

{
  const result = calculate({
    weight: 150,
    goodsAmount: 234,
    koreaShipping: 10,
    isOver50: false
  }, baseRates);

  assert.equal(result.isOverUsdThreshold, true);
  assert.equal(result.collectNationalTax, true);
  assert.equal(result.indivTax, 9150);
  closeTo(result.dutyTax, (234 + 10) * 1427.06 * 0.4);
  closeTo(result.vatTax, (result.customsValueKrw + result.dutyTax + 9150) * 0.1);
}

{
  const thresholdChf = (150 * 1427.06) / 1763.55;
  const rates = {
    currency: 'CHF',
    paymentRate: 1770,
    customsSelectedRate: 1763.55,
    customsUsdRate: 1427.06
  };
  const exact = calculate({
    weight: 150,
    goodsAmount: thresholdChf,
    koreaShipping: 40,
    isOver50: false
  }, rates);
  const over = calculate({
    weight: 150,
    goodsAmount: thresholdChf + 0.01,
    koreaShipping: 40,
    isOver50: false
  }, rates);

  assert.equal(exact.isOverUsdThreshold, false);
  assert.equal(over.isOverUsdThreshold, true);
  assert.equal(exact.thresholdKrw < exact.purchaseKrw, true);
  closeTo(over.customsValueKrw, (over.goodsAmount + 40) * rates.customsSelectedRate);
}

{
  const result = calculate({
    weight: 150,
    goodsAmount: 20,
    koreaShipping: 0,
    isOver50: true
  }, baseRates);

  assert.equal(result.shouldChargeDutyAndVat, true);
  assert.equal(result.indivTax, 9150);
  assert.ok(result.nationalTax >= 10000);
}

console.log('tax-policy tests passed');
