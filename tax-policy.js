(function attachCigarTaxPolicy(globalObject) {
  'use strict';

  const DEFAULT_POLICY = Object.freeze({
    thresholdUsd: 150,
    dutyRate: 0.4,
    vatRate: 0.1,
    tobaccoPerGram: 103,
    educationRate: 0.4399,
    individualPerGram: 61,
    nationalCollectionMinimum: 10000
  });

  function assertNonNegativeNumber(value, name) {
    if (!Number.isFinite(value) || value < 0) {
      throw new TypeError(`${name} must be a non-negative number`);
    }
  }

  function calculate(values, rates, policyOverrides = {}) {
    const policy = { ...DEFAULT_POLICY, ...policyOverrides };
    const {
      weight,
      goodsAmount,
      koreaShipping,
      isOver50 = false,
      shippingMode = 'direct'
    } = values;
    const {
      currency,
      paymentRate,
      customsSelectedRate,
      customsUsdRate
    } = rates;

    [
      ['weight', weight],
      ['goodsAmount', goodsAmount],
      ['koreaShipping', koreaShipping],
      ['paymentRate', paymentRate],
      ['customsSelectedRate', customsSelectedRate],
      ['customsUsdRate', customsUsdRate]
    ].forEach(([name, value]) => assertNonNegativeNumber(value, name));

    if (paymentRate === 0 || customsSelectedRate === 0 || customsUsdRate === 0) {
      throw new RangeError('exchange rates must be greater than zero');
    }

    const thresholdAmount = goodsAmount;
    const purchaseAmount = goodsAmount + koreaShipping;
    const goodsPurchaseKrw = goodsAmount * paymentRate;
    const shippingPurchaseKrw = koreaShipping * paymentRate;
    const purchaseKrw = goodsPurchaseKrw + shippingPurchaseKrw;

    const thresholdKrw = thresholdAmount * customsSelectedRate;
    const shippingKrw = koreaShipping * customsSelectedRate;
    const totalUsdEquivalent = thresholdKrw / customsUsdRate;
    const thresholdInSelectedCurrency = (policy.thresholdUsd * customsUsdRate) / customsSelectedRate;
    const isOverUsdThreshold = totalUsdEquivalent > policy.thresholdUsd;
    const shouldChargeDutyAndVat = isOverUsdThreshold || Boolean(isOver50);
    const customsValueKrw = shouldChargeDutyAndVat ? thresholdKrw + shippingKrw : thresholdKrw;

    const rawIndivTax = weight * policy.individualPerGram;
    const rawDutyTax = shouldChargeDutyAndVat ? customsValueKrw * policy.dutyRate : 0;
    const rawVatTax = shouldChargeDutyAndVat
      ? (customsValueKrw + rawDutyTax + rawIndivTax) * policy.vatRate
      : 0;

    // The 10,000 won minimum applies to customs-collected national taxes as a whole.
    const rawNationalTax = rawDutyTax + rawVatTax + rawIndivTax;
    const collectNationalTax = rawNationalTax >= policy.nationalCollectionMinimum;
    const dutyTax = collectNationalTax ? rawDutyTax : 0;
    const vatTax = collectNationalTax ? rawVatTax : 0;
    const indivTax = collectNationalTax ? rawIndivTax : 0;
    const nationalTax = dutyTax + vatTax + indivTax;

    const tobaccoTax = weight * policy.tobaccoPerGram;
    const eduTax = tobaccoTax * policy.educationRate;
    const localTax = tobaccoTax + eduTax;
    const dubuTax = dutyTax + vatTax;
    const totalTax = nationalTax + localTax;

    return {
      currency,
      shippingMode,
      weight,
      goodsAmount,
      koreaShipping,
      thresholdAmount,
      purchaseAmount,
      goodsPurchaseKrw,
      shippingPurchaseKrw,
      purchaseKrw,
      thresholdKrw,
      shippingKrw,
      customsValueKrw,
      totalUsdEquivalent,
      thresholdInSelectedCurrency,
      isOverUsdThreshold,
      isOver50: Boolean(isOver50),
      shouldChargeDutyAndVat,
      collectNationalTax,
      rawIndivTax,
      rawDutyTax,
      rawVatTax,
      rawNationalTax,
      dutyTax,
      vatTax,
      indivTax,
      nationalTax,
      tobaccoTax,
      eduTax,
      localTax,
      dubuTax,
      totalTax
    };
  }

  const api = Object.freeze({ policy: DEFAULT_POLICY, calculate });
  globalObject.CigarTaxPolicy = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
