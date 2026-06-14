"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import TransactionRow from "@/components/transactions/TransactionRow";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import { getAvailableMonths } from "@/lib/analytics";
import { CATEGORY_ICONS, formatCurrency, cn } from "@/lib/utils";
import { Search, SlidersHorizontal, Plus, Pencil, ArrowLeftRight } from "lucide-react";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeMonth, setActiveMonth] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [addOpen, setAddOpen] = useState(false);

  const load = () =>
    fetch("/api/transactions")
      .then(r => r.json())
      .then(d => setTransactions(d.transactions ?? []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const months = getAvailableMonths(transactions);
  const allCategories = ["All", ...Array.from(new Set(transactions.map(t => t.primary_category)))];

  const filtered = transactions
    .filter(t => {
      const matchSearch = search === "" ||
        (t.merchant_name || t.name).toLowerCase().includes(search.toLowerCase()) ||
        t.primary_category.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || t.primary_category === activeCategory;
      const matchMonth = activeMonth === "all" || t.date.startsWith(activeMonth);
      return matchSearch && matchCat && matchMonth;
    })
    .sort((a, b) =>
      sortBy === "date"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : Math.abs(b.amount) - Math.abs(a.amount)
    );

  const totalSpend = filtered.filter(t => t.amount > 0 && t.primary_category !== "Income").reduce((s, t) => s + t.amount, 0);
  const totalIncome = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Header title="Transactions" subtitle="Loading…" />
        <div className="px-6 py-6 space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-bg-card border border-border rounded-xl h-16 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header title="Transactions" subtitle={`${transactions.length} total`} />

      <div className="px-6 py-6 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Shown</p>
            <p className="text-xl font-bold text-text-primary">{filtered.length}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Total Spent</p>
            <p className="text-xl font-bold text-danger-DEFAULT">-{formatCurrency(totalSpend)}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Total Income</p>
            <p className="text-xl font-bold text-success-DEFAULT">+{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Net</p>
            <p className={`text-xl font-bold ${totalIncome - totalSpend >= 0 ? "text-success-DEFAULT" : "text-danger-DEFAULT"}`}>
              {formatCurrency(totalIncome - totalSpend)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-bg-elevated border border-border rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search merchant, category…"
                className="bg-transparent text-sm text-text-primary outline-none w-full placeholder:text-text-muted" />
            </div>
            <select value={activeMonth} onChange={e => setActiveMonth(e.target.value)}
              className="bg-bg-elevated border border-border text-text-secondary text-xs rounded-lg px-3 py-2 outline-none cursor-pointer">
              <option value="all">All months</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as "date" | "amount")}
              className="bg-bg-elevated border border-border text-text-secondary text-xs rounded-lg px-3 py-2 outline-none cursor-pointer">
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn("text-xs px-3 py-1.5 rounded-full border transition-all",
                  activeCategory === cat
                    ? "bg-accent-purple/20 border-accent-purple/40 text-accent-purple-light"
                    : "bg-bg-elevated border-border text-text-muted hover:text-text-secondary")}>
                {cat !== "All" && CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-xs font-medium text-text-secondary">{filtered.length} results</p>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-accent-purple-light hover:underline">
              <Pencil className="w-3 h-3" /> Add manually
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <ArrowLeftRight className="w-10 h-10 text-text-disabled" />
              <p className="text-sm font-medium text-text-secondary">No transactions yet</p>
              <p className="text-xs text-text-muted">Connect your bank or add one manually</p>
              <button onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 text-xs text-accent-purple-light hover:underline mt-1">
                <Plus className="w-3 h-3" /> Add manually
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-text-muted">No transactions match your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map(t => <TransactionRow key={t.id} transaction={t} />)}
            </div>
          )}
        </div>

      </div>

      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={load} />
    </div>
  );
}
