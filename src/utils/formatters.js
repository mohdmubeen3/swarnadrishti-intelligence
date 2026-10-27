/**
 * Quantitative Formatting Utilities
 * Adheres strictly to the rule: Missing information is NEVER represented as zero.
 */

export const EMPTY_PLACEHOLDER = '—';

export function formatINR(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) {
    return EMPTY_PLACEHOLDER;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);
}

export function formatPrice(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) {
    return EMPTY_PLACEHOLDER;
  }
  return Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatPercent(val, decimals = 2, showSign = false) {
  if (val === null || val === undefined || isNaN(val)) {
    return EMPTY_PLACEHOLDER;
  }
  const num = Number(val);
  const sign = showSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}

export function formatBps(val, decimals = 1, showSign = false) {
  if (val === null || val === undefined || isNaN(val)) {
    return EMPTY_PLACEHOLDER;
  }
  const num = Number(val);
  const sign = showSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)} bps`;
}

export function formatZScore(val) {
  if (val === null || val === undefined || isNaN(val)) {
    return EMPTY_PLACEHOLDER;
  }
  const num = Number(val);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}σ`;
}

export function formatVolume(val) {
  if (val === null || val === undefined || isNaN(val)) {
    return EMPTY_PLACEHOLDER;
  }
  return Number(val).toLocaleString('en-IN');
}

export function formatDate(dateStr) {
  if (!dateStr) return EMPTY_PLACEHOLDER;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateStr);
  }
}

export function formatTimestamp(isoStr) {
  if (!isoStr) return EMPTY_PLACEHOLDER;
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(isoStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return String(isoStr);
  }
}
