"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import SpendingDonut from "@/components/charts/SpendingDonut";
import MonthlyComparison from "@/components/charts/MonthlyComparison";
import CategoryTrend from "@/components/charts/CategoryTrend";
import TopMerchantsBar from "@/components/charts/TopMerchantsBar";
import DayOfWeekChart from "@/components/charts/DayOfWeekChart";
import PaymentChannelPie from "@/components/charts/PaymentChannelPie";
import MonthlyTrend from "@/components/charts/MonthlyTrend";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import {
  getSpendingCategories, getMonthComparison, getCategoryTrend,
  getTopMerchants, getPaymentChannelSplit, getDayOfWeekPattern,
  getMonthlyTrendData, getAvailableMonths,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";
import { BarChart3, TrendingDown, TrendingUp, Zap, Plus, BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetch("/api/transactions")
      .then(r => r.json())
      .then(d => {
        const txns: Transaction[] = d.transactions ?? [];
        setTransactions(txns);
        const months = getAvailableMonths(txns);
        if (months.length > 0) setSelectedMonth(months[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Header title="Analytics" subtitle="Loading…" />
        <div className="px-6 py-6 grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-bg-card border border-border rounded-xl h-28 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="animate-fade-in">
        <Header title="Analytics" subtitle="No data yet" />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-4 text-center">
          <BarChart2 className="w-12 h-12 text-text-disabled" />
          <p className="text-base font-semibold text-text-secondary">No transaction data yet</p>
          <p className="text-sm text-text-muted">Connect your bank or add transactions manually to see analytics.</p>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-purple text-white text-xs font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-glow">
            <Plus className="w-3.5 h-3.5" /> Add Transaction
          </button>
          <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
        </div>
      </div>
    );
  }

  const months = getAvailableMonths(transactions);
  const active = selectedMonth || months[0];
  const prevMonth = months[months.indexOf(active) + 1] ?? months[months.length - 1];

  const categories = getSpendingCategories(transactions, active);
  const comparison = getMonthComparison(transactions, active, prevMonth);
  const { data: trendData, categories: trendCats } = getCategoryTrend(transactions, 5);
  const topMerchants = getTopMerchants(transactions, 8);
  const channelSplit = getPaymentChannelSplit(transactions);
  const dayPattern = getDayOfWeekPattern(transactions);
  const monthlyData = getMonthlyTrendData(transactions);

  const totalSpend = transactions.filter(t => t.date.startsWith(active) && t.amount > 0 && t.primary_category !== "Income").reduce((s, t) => s + t.amount, 0);
  const prevSpend = transactions.filter(t => t.date.startsWith(prevMonth) && t.amount > 0 && t.primary_category !== "Income").reduce((s, t) => s + t.amount, 0);
  const spendChange = prevSpend > 0 ? ((totalSpend - prevSpend) / prevSpend) * 100 : 0;
  const activeTxns = transactions.filter(t => t.date.startsWith(active) && t.amount > 0);
  const avgTx = activeTxns.length > 0 ? totalSpend / activeTxns.length : 0;
  const topCat = categories[0];

  const kpis = [
    { label: "Total Spent", value: formatCurrency(totalSpend), change: spendChange, icon: TrendingDown, positive: spendChange < 0 },
    { label: "Avg. Transaction", value: formatCurrency(avgTx), change: null, icon: BarChart3, positive: true },
    { label: "Transactions", value: activeTxns.length.toString(), change: null, icon: Zap, positive: true },
    { label: "Top Category", value: topCat?.name || "—", sub: topCat ? formatCurrency(topCat.amount) : "", icon: TrendingUp, positive: true },
  ];

  return (
    <div className="animate-fade-in">
      <Header title="Analytics" subtitle="Deep dive into your spending patterns" />

      <div className="px-6 py-6 space-y-6">

        {/* Month selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Viewing:</span>
            <div className="flex gap-1">
              {months.map(m => (
                <button key={m} onClick={() => setSelectedMonth(m)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${active === m ? "bg-accent-purple/20 border-accent-purple/40 text-accent-purple-light" : "bg-bg-elevated border-border text-text-muted hover:text-text-secondary"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-purple text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-glow">
            <Plus className="w-3.5 h-3.5" /> Add Transaction
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-bright transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-text-muted">{k.label}</p>
                <div className="w-7 h-7 rounded-lg bg-bg-elevated flex items-center justify-center">
                  <k.icon className="w-3.5 h-3.5 text-text-muted" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-primary truncate">{k.value}</p>
              {k.sub && <p className="text-xs text-text-muted mt-0.5">{k.sub}</p>}
              {k.change !== null && (
                <div className={`flex items-center gap-1 mt-1 text-[11px] font-medium ${k.positive ? "text-success-DEFAULT" : "text-danger-DEFAULT"}`}>
                  {k.positive ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {k.change > 0 ? "+" : ""}{k.change.toFixed(1)}% vs {prevMonth}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Donut + Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Spending Breakdown</h2>
                <p className="text-[11px] text-text-muted mt-0.5">{active}</p>
              </div>
              <span className="text-xs font-bold text-text-primary">{formatCurrency(totalSpend)}</span>
            </div>
            {categories.length > 0 ? <SpendingDonut categories={categories} /> : <div className="h-40 flex items-center justify-center text-sm text-text-muted">No spending this month</div>}
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Month-over-Month</h2>
                <p className="text-[11px] text-text-muted mt-0.5">{active} vs {prevMonth}</p>
              </div>
            </div>
            {comparison.length > 0 ? <MonthlyComparison data={comparison} currentLabel={active} previousLabel={prevMonth} /> : <div className="h-40 flex items-center justify-center text-sm text-text-muted">Not enough data</div>}
          </div>
        </div>

        {/* Cash flow */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Cash Flow Over Time</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Income vs spending vs savings by month</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-text-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success-DEFAULT inline-block" />Income</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger-DEFAULT inline-block" />Spending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-purple inline-block" />Savings</span>
            </div>
          </div>
          <MonthlyTrend data={monthlyData} />
        </div>

        {/* Category trend + Payment channel */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Category Trends</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Top 5 categories over time</p>
            </div>
            {trendCats.length > 0 ? <CategoryTrend data={trendData} categories={trendCats} /> : <div className="h-40 flex items-center justify-center text-sm text-text-muted">Not enough data</div>}
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Payment Method Split</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Online vs in-store vs other</p>
            </div>
            {channelSplit.length > 0 ? <PaymentChannelPie data={channelSplit} /> : <div className="h-40 flex items-center justify-center text-sm text-text-muted">No data</div>}
          </div>
        </div>

        {/* Top merchants + Day of week */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Top Merchants</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Where the most money goes</p>
            </div>
            {topMerchants.length > 0 ? <TopMerchantsBar data={topMerchants} /> : <div className="h-40 flex items-center justify-center text-sm text-text-muted">No data</div>}
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Spending by Day</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Which day of week you spend most</p>
            </div>
            <DayOfWeekChart data={dayPattern} />
            <div className="mt-4 grid grid-cols-7 gap-1">
              {dayPattern.map(d => {
                const maxAmt = Math.max(...dayPattern.map(x => x.amount));
                return (
                  <div key={d.day} className="text-center">
                    <div className="w-full h-1.5 rounded-full mb-1" style={{
                      backgroundColor: d.amount > 0 ? "#7c3aed" : "#262637",
                      opacity: d.amount > 0 && maxAmt > 0 ? 0.3 + (d.amount / maxAmt) * 0.7 : 1,
                    }} />
                    <p className="text-[9px] text-text-muted">{d.short}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
