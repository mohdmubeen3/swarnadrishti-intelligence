/**
 * Official MCX Gold Futures Contract Specifications
 * Reference: Multi Commodity Exchange of India (MCX) Daily Bhavcopy & Contract DNA
 */
export const MCX_GOLD_CONTRACTS = {
  GOLDM: {
    symbol: 'GOLDM',
    name: 'Gold Mini Futures',
    tradingUnit: '100 grams',
    tradingUnitGrams: 100,
    quotationUnit: '10 grams',
    quotationUnitGrams: 10,
    purity: '995 fine gold (99.5%)',
    purityFactor: 0.995,
    tickSize: 1.0, // Rs per 10g
    priceQuotationBasis: 'Rs. per 10 grams',
    deliveryUnit: '100 grams and in multiples thereof',
    tenderPeriodDays: 5,
    description: 'Gold Mini futures contract, standard 100g physical settlement unit.'
  },
  GOLDTEN: {
    symbol: 'GOLDTEN',
    name: 'Gold Ten Futures',
    tradingUnit: '10 grams',
    tradingUnitGrams: 10,
    quotationUnit: '10 grams',
    quotationUnitGrams: 10,
    purity: '995 fine gold (99.5%)',
    purityFactor: 0.995,
    tickSize: 1.0, // Rs per 10g
    priceQuotationBasis: 'Rs. per 10 grams',
    deliveryUnit: '10 grams and in multiples thereof',
    tenderPeriodDays: 5,
    description: 'Gold Ten futures contract, offering granular 10-gram exposure.'
  },
  GOLDGUINEA: {
    symbol: 'GOLDGUINEA',
    name: 'Gold Guinea Futures',
    tradingUnit: '8 grams',
    tradingUnitGrams: 8,
    quotationUnit: '8 grams',
    quotationUnitGrams: 8,
    purity: '999 fine gold (99.9%)',
    purityFactor: 0.999,
    tickSize: 1.0, // Rs per 8g
    priceQuotationBasis: 'Rs. per 8 grams',
    deliveryUnit: '8 grams (1 Guinea)',
    tenderPeriodDays: 5,
    description: 'Gold Guinea sovereign weight contract, quoted per 8 grams at 999 purity.'
  },
  GOLDPETAL: {
    symbol: 'GOLDPETAL',
    name: 'Gold Petal Futures',
    tradingUnit: '1 gram',
    tradingUnitGrams: 1,
    quotationUnit: '1 gram',
    quotationUnitGrams: 1,
    purity: '999 fine gold (99.9%)',
    purityFactor: 0.999,
    tickSize: 1.0, // Rs per 1g
    priceQuotationBasis: 'Rs. per 1 gram',
    deliveryUnit: '1 gram',
    tenderPeriodDays: 5,
    description: 'Gold Petal micro-futures contract, enabling 1-gram physical delivery.'
  }
};

/**
 * Standard fine-gold normalization helper.
 * Standardizes any MCX gold contract quotation to Rs. per 10 grams of 999 fine gold basis.
 * 
 * Formula:
 * Price_per_gram = RawPrice / QuotationUnitGrams
 * FineGold_Price_per_gram = Price_per_gram / PurityFactor * 0.999
 * NormalizedPrice_per_10g = FineGold_Price_per_gram * 10
 */
export function normalizeGoldPriceTo10g(rawPrice, contractSymbol) {
  if (rawPrice == null || isNaN(rawPrice) || rawPrice <= 0) return null;
  const spec = MCX_GOLD_CONTRACTS[contractSymbol];
  if (!spec) return null;

  const pricePerGram = rawPrice / spec.quotationUnitGrams;
  const finePricePerGram = (pricePerGram / spec.purityFactor) * 0.999;
  return Number((finePricePerGram * 10).toFixed(2));
}

/**
 * Eligible contract pairs for relative-value analysis
 */
export const ELIGIBLE_PAIRS = [
  { id: 'GOLDM-GOLDTEN', legA: 'GOLDM', legB: 'GOLDTEN', name: 'GOLDM / GOLDTEN' },
  { id: 'GOLDM-GOLDGUINEA', legA: 'GOLDM', legB: 'GOLDGUINEA', name: 'GOLDM / GOLDGUINEA' },
  { id: 'GOLDM-GOLDPETAL', legA: 'GOLDM', legB: 'GOLDPETAL', name: 'GOLDM / GOLDPETAL' },
  { id: 'GOLDTEN-GOLDGUINEA', legA: 'GOLDTEN', legB: 'GOLDGUINEA', name: 'GOLDTEN / GOLDGUINEA' },
  { id: 'GOLDTEN-GOLDPETAL', legA: 'GOLDTEN', legB: 'GOLDPETAL', name: 'GOLDTEN / GOLDPETAL' },
  { id: 'GOLDGUINEA-GOLDPETAL', legA: 'GOLDGUINEA', legB: 'GOLDPETAL', name: 'GOLDGUINEA / GOLDPETAL' },
];
