import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/utils";
import type { Transaction, MonthlyData, SpendingCategory } from "@/types";

export interface ComparisonRow {
  category: string;
  icon: string;
  color: string;
  current: number;
  previous: number;
}

export interface TrendPoint {
  month: string;
  [category: string]: number | string;
}

export interface ChannelSlice {
  name: string;
  value: number;
  color: string;
}

export interface MerchantItem {
  name: string;
  amount: number;
  color: string;
}

export interface DayPoint {
  day: string;
  short: string;
  amount: number;
}

// Returns unique YYYY-MM strings sorted descending, derived from real transactions
export function getAvailableMonths(transactions: Transaction[]): string[] {
  const months = Array.from(new Set(transactions.map(t => t.date.slice(0, 7))));
  return months.sort((a, b) => b.localeCompare(a));
}

export function getSpendingCategories(transactions: Transaction[], month: string): SpendingCategory[] {
  const prevMonth = shiftMonth(month, -1);

  const bucket = (m: string) =>
    transactions.reduce<Record<string, number>>((acc, t) => {
      if (t.date.startsWith(m) && t.amount > 0 && t.primary_category !== "Income") {
        acc[t.primary_category] = (acc[t.primary_category] || 0) + t.amount;
      }
      return acc;
    }, {});

  const cur = bucket(month);
  const prev = bucket(prevMonth);
  const total = Object.values(cur).reduce((s, v) => s + v, 0);

  return Object.entries(cur)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => {
      const p = prev[name] || 0;
      return {
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CATEGORY_COLORS[name] || "#334155",
        icon: CATEGORY_ICONS[name] || "📦",
        change: p > 0 ? ((amount - p) / p) * 100 : 0,
      };
    });
}

export function getMonthlyTrendData(transactions: Transaction[]): MonthlyData[] {
  const months = getAvailableMonths(transactions).slice().reverse(); // oldest first
  return months.map(m => {
    const income = Math.abs(
      transactions.filter(t => t.date.startsWith(m) && t.amount < 0).reduce((s, t) => s + t.amount, 0)
    );
    const spending = transactions
      .filter(t => t.date.startsWith(m) && t.amount > 0 && t.primary_category !== "Income")
      .reduce((s, t) => s + t.amount, 0);
    return { month: m.slice(5), income, spending, savings: income - spending };
  });
}

export function getMonthComparison(transactions: Transaction[], currentMonth: string, previousMonth: string): ComparisonRow[] {
  const bucket = (m: string) =>
    transactions.reduce<Record<string, number>>((acc, t) => {
      if (t.date.startsWith(m) && t.amount > 0 && t.primary_category !== "Income") {
        acc[t.primary_category] = (acc[t.primary_category] || 0) + t.amount;
      }
      return acc;
    }, {});

  const cur = bucket(currentMonth);
  const prev = bucket(previousMonth);
  const allCats = Array.from(new Set([...Object.keys(cur), ...Object.keys(prev)]));

  return allCats
    .sort((a, b) => (cur[b] || 0) - (cur[a] || 0))
    .map(cat => ({
      category: cat,
      icon: CATEGORY_ICONS[cat] || "📦",
      color: CATEGORY_COLORS[cat] || "#334155",
      current: cur[cat] || 0,
      previous: prev[cat] || 0,
    }));
}

export function getCategoryTrend(transactions: Transaction[], topN = 5): { data: TrendPoint[]; categories: string[] } {
  const months = getAvailableMonths(transactions).slice().reverse();

  const totals: Record<string, number> = {};
  for (const t of transactions) {
    if (t.amount > 0 && t.primary_category !== "Income") {
      totals[t.primary_category] = (totals[t.primary_category] || 0) + t.amount;
    }
  }

  const categories = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([cat]) => cat);

  const data: TrendPoint[] = months.map(m => {
    const point: TrendPoint = { month: m.slice(5) };
    for (const cat of categories) {
      point[cat] = transactions
        .filter(t => t.date.startsWith(m) && t.primary_category === cat && t.amount > 0)
        .reduce((s, t) => s + t.amount, 0);
    }
    return point;
  });

  return { data, categories };
}

export function getTopMerchants(transactions: Transaction[], n = 8): MerchantItem[] {
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    if (t.amount > 0 && t.primary_category !== "Income") {
      const name = t.merchant_name || t.name;
      totals[name] = (totals[name] || 0) + t.amount;
    }
  }
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, amount]) => ({ name, amount, color: CATEGORY_COLORS["Shopping"] || "#7c3aed" }));
}

export function getPaymentChannelSplit(transactions: Transaction[]): ChannelSlice[] {
  const CHANNEL_COLORS: Record<string, string> = { "online": "#7c3aed", "in store": "#3b82f6", "other": "#475569" };
  const LABELS: Record<string, string> = { "online": "Online", "in store": "In Store", "other": "Other" };

  const totals: Record<string, number> = {};
  for (const t of transactions) {
    if (t.amount > 0 && t.primary_category !== "Income") {
      totals[t.payment_channel] = (totals[t.payment_channel] || 0) + t.amount;
    }
  }
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([ch, value]) => ({ name: LABELS[ch] || ch, value, color: CHANNEL_COLORS[ch] || "#334155" }));
}

export function getDayOfWeekPattern(transactions: Transaction[]): DayPoint[] {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    if (t.amount > 0 && t.primary_category !== "Income") {
      const [y, m, d] = t.date.split("-").map(Number);
      const label = DAYS[new Date(y, m - 1, d).getDay()];
      totals[label] = (totals[label] || 0) + t.amount;
    }
  }
  return DAYS.map(day => ({ day, short: day[0], amount: totals[day] || 0 }));
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
