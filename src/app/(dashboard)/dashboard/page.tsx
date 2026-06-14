"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import BankCard from "@/components/cards/BankCard";
import SpendingDonut from "@/components/charts/SpendingDonut";
import MonthlyTrend from "@/components/charts/MonthlyTrend";
import MonthlyComparison from "@/components/charts/MonthlyComparison";
import TransactionRow from "@/components/transactions/TransactionRow";
import BudgetCard from "@/components/budget/BudgetCard";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import ConnectBankButton from "@/components/plaid/ConnectBankButton";
import {
  getSpendingCategories, getMonthComparison, getMonthlyTrendData, getAvailableMonths,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import type { Account, Transaction, Budget } from "@/types";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Sparkles, Landmark } from "lucide-react";

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trend" | "compare">("trend");

  useEffect(() => {
    Promise.all([
      fetch("/api/plaid/accounts").then(r => r.json()),
      fetch("/api/transactions").then(r => r.json()),
      fetch("/api/budgets").then(r => r.json()),
    ]).then(([a, t, b]) => {
      setAccounts(a.accounts ?? []);
      setTransactions(t.transactions ?? []);
      setBudgets(b.budgets ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Header title="Dashboard" subtitle="Loading your finances…" />
        <div className="px-6 py-6 grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl p-4 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // No bank connected yet
  if (accounts.length === 0) {
    return (
      <div className="animate-fade-in">
        <Header title="Dashboard" subtitle="Connect your bank to get started" />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-6 text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
            <Landmark className="w-10 h-10 text-accent-purple-light" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No bank connected yet</h2>
            <p className="text-sm text-text-muted max-w-sm">
              Link your bank account via Plaid to see your real balances, transactions, and spending insights.
            </p>
          </div>
          <ConnectBankButton />
        </div>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const months = getAvailableMonths(transactions);
  const prevMonth = months[1] ?? currentMonth;

  const totalAssets = accounts.filter(a => a.type === "depository").reduce((s, a) => s + a.current_balance, 0);
  const totalDebt = accounts.filter(a => a.type === "credit").reduce((s, a) => s + Math.abs(a.current_balance), 0);
  const netWorth = totalAssets - totalDebt;

  const monthlySpend = transactions
    .filter(t => t.date.startsWith(currentMonth) && t.amount > 0 && t.primary_category !== "Income")
    .reduce((s, t) => s + t.amount, 0);
  const monthlyIncome = Math.abs(
    transactions.filter(t => t.date.startsWith(currentMonth) && t.amount < 0).reduce((s, t) => s + t.amount, 0)
  );
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlySpend) / monthlyIncome) * 100 : 0;

  const prevSpend = transactions
    .filter(t => t.date.startsWith(prevMonth) && t.amount > 0 && t.primary_category !== "Income")
    .reduce((s, t) => s + t.amount, 0);
  const spendChange = prevSpend > 0 ? ((monthlySpend - prevSpend) / prevSpend) * 100 : 0;

  const categories = getSpendingCategories(transactions, currentMonth);
  const comparison = getMonthComparison(transactions, currentMonth, prevMonth);
  const monthlyData = getMonthlyTrendData(transactions);

  const stats = [
    { label: "Net Worth", value: formatCurrency(netWorth), change: null, up: true, icon: Wallet, accent: "text-accent-purple-light", bg: "bg-accent-purple/10" },
    { label: "Monthly Income", value: formatCurrency(monthlyIncome), change: null, up: true, icon: ArrowUpRight, accent: "text-success-DEFAULT", bg: "bg-success-muted" },
    { label: "Monthly Spend", value: formatCurrency(monthlySpend), change: spendChange, up: spendChange <= 0, icon: ArrowDownRight, accent: "text-danger-DEFAULT", bg: "bg-danger-muted" },
    { label: "Savings Rate", value: `${savingsRate.toFixed(0)}%`, change: null, up: true, icon: Sparkles, accent: "text-accent-blue", bg: "bg-accent-blue/10" },
  ];

  return (
    <div className="animate-fade-in">
      <Header title="Dashboard" subtitle={`${currentMonth} · ${accounts.length} account${accounts.length !== 1 ? "s" : ""} linked`} />

      <div className="px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-bright transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-text-muted">{s.label}</p>
                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-3.5 h-3.5 ${s.accent}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">{s.value}</p>
              {s.change !== null && (
                <div className="flex items-center gap-1 mt-1.5">
                  {s.up ? <TrendingDown className="w-3 h-3 text-success-DEFAULT" /> : <TrendingUp className="w-3 h-3 text-danger-DEFAULT" />}
                  <span className={`text-[11px] font-medium ${s.up ? "text-success-DEFAULT" : "text-danger-DEFAULT"}`}>
                    {s.change > 0 ? "+" : ""}{s.change.toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-text-muted">vs last month</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">My Accounts</h2>
            <a href="/cards" className="text-xs text-accent-purple-light hover:underline">View all →</a>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {accounts.map(acc => <BankCard key={acc.id} account={acc} compact />)}
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Spending Breakdown</h2>
                <p className="text-[11px] text-text-muted mt-0.5">{currentMonth} · {formatCurrency(monthlySpend)}</p>
              </div>
              <a href="/analytics" className="text-[11px] text-accent-purple-light hover:underline">Full analysis →</a>
            </div>
            {categories.length > 0 ? (
              <SpendingDonut categories={categories} />
            ) : (
              <div className="flex items-center justify-center h-40 text-text-muted text-sm">No spending data yet</div>
            )}
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">
                {activeTab === "trend" ? "Income vs Spending" : "Month-over-Month"}
              </h2>
              <div className="flex gap-1 p-0.5 bg-bg-elevated border border-border rounded-lg">
                {(["trend", "compare"] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${activeTab === t ? "bg-accent-purple/20 text-accent-purple-light" : "text-text-muted hover:text-text-secondary"}`}>
                    {t === "trend" ? "Trend" : "Compare"}
                  </button>
                ))}
              </div>
            </div>
            {monthlyData.length > 0 ? (
              activeTab === "trend" ? (
                <MonthlyTrend data={monthlyData} />
              ) : (
                <MonthlyComparison data={comparison.slice(0, 5)} currentLabel={currentMonth.slice(5)} previousLabel={prevMonth.slice(5)} />
              )
            ) : (
              <div className="flex items-center justify-center h-40 text-text-muted text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Recent Transactions</h2>
              <a href="/transactions" className="text-xs text-accent-purple-light hover:underline">View all →</a>
            </div>
            {transactions.length > 0 ? (
              <div className="space-y-0.5">
                {transactions.slice(0, 7).map(t => <TransactionRow key={t.id} transaction={t} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <p className="text-sm text-text-muted">No transactions yet</p>
                <p className="text-xs text-text-disabled">Plaid will sync them automatically after you connect</p>
              </div>
            )}
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Budgets</h2>
              <a href="/budgets" className="text-xs text-accent-purple-light hover:underline">
                {budgets.length === 0 ? "Set up →" : "View all →"}
              </a>
            </div>
            {budgets.length > 0 ? (
              <div className="space-y-3">
                {budgets.slice(0, 3).map(b => <BudgetCard key={b.id} budget={b} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <p className="text-sm text-text-muted">No budgets set</p>
                <a href="/budgets" className="text-xs text-accent-purple-light hover:underline">Create one →</a>
              </div>
            )}
          </div>
        </div>

      </div>

      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={() => {
        fetch("/api/transactions").then(r => r.json()).then(d => setTransactions(d.transactions ?? []));
      }} />
    </div>
  );
}
