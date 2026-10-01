import { JarDefinition, JarKey } from '../types';

export const JARS: JarDefinition[] = [
  {
    key: 'inbox',
    letter: '✦',
    name: 'Income Inbox',
    color: '#2DD4BF',
    defaultPct: 0,
    short: 'Inbox',
    desc: 'Every payment lands here first, unallocated. Your staging area before the split.',
  },
  {
    key: 'daily',
    letter: 'D',
    name: 'Daily Needs',
    color: '#FB7185',
    defaultPct: 22,
    short: 'Daily Needs',
    desc: 'Groceries, transport, airtime, data, personal care, household essentials.',
  },
  {
    key: 'bills',
    letter: 'U',
    name: 'Utilities & Bills',
    color: '#F59E0B',
    defaultPct: 14,
    short: 'Bills',
    desc: 'Rent, electricity, water, internet, phone, insurance, recurring bills.',
  },
  {
    key: 'debt',
    letter: 'D',
    name: 'Debt Payoff',
    color: '#EF4444',
    defaultPct: 13,
    short: 'Debt',
    desc: 'Loans, credit cards, BNPL, money owed. Funded every single paycheck.',
  },
  {
    key: 'unplanned',
    letter: 'U',
    name: 'Unplanned',
    color: '#A78BFA',
    defaultPct: 10,
    short: 'Unplanned',
    desc: 'Your emergency cushion. Medical, urgent car repairs, job transitions.',
  },
  {
    key: 'goals',
    letter: 'M',
    name: 'Money Goals',
    color: '#10B981',
    defaultPct: 17,
    short: 'Goals',
    desc: 'Named savings targets — travel, wedding, new car, house deposit, school fees.',
  },
  {
    key: 'enjoyment',
    letter: 'O',
    name: 'Own Enjoyment',
    color: '#EC4899',
    defaultPct: 12,
    short: 'Enjoyment',
    desc: 'Guilt-free spending. Dining out, hobbies, gifts, treats. This is the point.',
  },
  {
    key: 'retirement',
    letter: 'R',
    name: 'Retirement',
    color: '#6366F1',
    defaultPct: 12,
    short: 'Retirement',
    desc: 'Your future self, funded every single paycheck to compound over time.',
  },
];

export const SPLIT_JARS = JARS.filter((j) => j.key !== 'inbox');

export function getJar(key: string): JarDefinition {
  return JARS.find((j) => j.key === key) || JARS[0];
}

export function formatMoney(n: number | string | undefined | null, symbol = '$'): string {
  const num = Number(n) || 0;
  const neg = num < 0;
  const absVal = Math.abs(num);
  const s = absVal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (neg ? '-' : '') + symbol + s;
}

export function formatShortMoney(n: number | string | undefined | null, symbol = '$'): string {
  const num = Number(n) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${symbol}${abs.toFixed(2)}`;
}

export function round2(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}
