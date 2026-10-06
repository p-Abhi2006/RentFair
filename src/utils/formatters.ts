import { FairnessCategory } from '../types/rental';

/**
 * Validates whether a rent amount is a valid positive number.
 * Disqualifies null, undefined, non-numbers, NaN, infinite, zero, negative, and near-zero amounts (< 1).
 */
export function isValidRent(amount: number | null | undefined): boolean {
  if (amount == null) return false;
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(num) || !isFinite(num)) return false;
  return num >= 1;
}

export function formatCurrency(amount: number | null | undefined): string {
  if (!isValidRent(amount)) {
    return 'Price on request';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount as number);
}

export function formatPricePerSqft(pricePerSqft: number | null | undefined): string {
  if (pricePerSqft == null || isNaN(pricePerSqft) || pricePerSqft < 1) {
    return '₹/sqft unavailable';
  }
  return `₹${Math.round(pricePerSqft)}/sqft`;
}

export function formatArea(sqft: number | null | undefined): string {
  if (sqft == null || isNaN(sqft) || sqft <= 0) {
    return 'Area not specified';
  }
  return `${sqft.toLocaleString('en-IN')} sq.ft`;
}

export function formatVariance(variance: number | null | undefined): { text: string; isPositive: boolean; isNeutral: boolean } {
  if (variance == null || isNaN(variance)) {
    return { text: 'Baseline Not Applicable', isPositive: false, isNeutral: true };
  }
  const rounded = Math.round(variance * 10) / 10;
  if (Math.abs(rounded) <= 2) {
    return { text: 'Near Typical (±2%)', isPositive: false, isNeutral: true };
  }
  if (rounded > 0) {
    return { text: `+${rounded}% Above Typical`, isPositive: false, isNeutral: false };
  }
  return { text: `${rounded}% Below Typical`, isPositive: true, isNeutral: false };
}

export function getFairnessColorDetails(category: FairnessCategory | null | undefined): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  label: string;
  shortLabel: string;
  recommendation: string;
} {
  if (!category) {
    return {
      badgeBg: 'bg-slate-900/60',
      badgeText: 'text-slate-300',
      badgeBorder: 'border-slate-800/60',
      dotColor: 'bg-slate-500',
      label: 'Unassessed (Price Pending)',
      shortLabel: 'Unassessed',
      recommendation: 'Price not publicly listed. Request pricing directly from source listing.',
    };
  }
  switch (category) {
    case 'SIGNIFICANTLY_BELOW_TYPICAL':
    case 'HIGHLY_COMPETITIVE':
      return {
        badgeBg: 'bg-teal-950/60',
        badgeText: 'text-teal-300',
        badgeBorder: 'border-teal-800/60',
        dotColor: 'bg-teal-400',
        label: 'Below Typical',
        shortLabel: 'Below Typical',
        recommendation: 'Asking price is notably below comparable median / lower IQR fence.',
      };
    case 'BELOW_TYPICAL':
      return {
        badgeBg: 'bg-teal-950/40',
        badgeText: 'text-teal-300',
        badgeBorder: 'border-teal-800/40',
        dotColor: 'bg-teal-400',
        label: 'Below Typical',
        shortLabel: 'Below Typical',
        recommendation: 'Asking price is below comparable median, within typical range.',
      };
    case 'FAIR':
      return {
        badgeBg: 'bg-sky-950/60',
        badgeText: 'text-sky-300',
        badgeBorder: 'border-sky-800/60',
        dotColor: 'bg-sky-400',
        label: 'Near Typical',
        shortLabel: 'Near Typical',
        recommendation: 'Asking price aligns with median comparable listings in this locality.',
      };
    case 'ABOVE_TYPICAL':
    case 'SLIGHTLY_HIGH':
      return {
        badgeBg: 'bg-amber-950/60',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-800/60',
        dotColor: 'bg-amber-400',
        label: 'Above Typical',
        shortLabel: 'Above Typical',
        recommendation: 'Modest premium over median; assess furnishing and specific amenities.',
      };
    case 'SIGNIFICANTLY_ABOVE_TYPICAL':
    case 'OVERPRICED':
    case 'EXTREME_OUTLIER':
      return {
        badgeBg: 'bg-amber-950/60',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-800/60',
        dotColor: 'bg-amber-400',
        label: 'Above Typical',
        shortLabel: 'Above Typical',
        recommendation: 'Above comparable median / upper IQR boundary.',
      };
  }
}
