"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import BudgetCard from "@/components/budget/BudgetCard";
import { CATEGORY_ICONS } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { Budget } from "@/types";
import { Target, TrendingUp, Plus, X, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Food and Drink", "Shopping", "Transportation", "Entertainment",
  "Healthcare", "Travel", "Utilities", "Housing", "Education", "Personal", "Other",
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState("Food and Drink");
  const [formAmount, setFormAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () =>
    fetch("/api/budgets")
      .then(r => r.json())
      .then(d => setBudgets(d.budgets ?? []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount) return;
    setSaving(true);
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: formCategory, limitAmount: formAmount }),
    });
    setFormAmount("");
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    await load();
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Header title="Budgets" subtitle="Loading…" />
        <div className="px-6 py-6 grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-bg-card border border-border rounded-xl h-28 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const totalBudgeted = budgets.reduce((s, b) => s + b.limit_amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent_amount, 0);
  const overBudget = budgets.filter(b => b.spent_amount > b.limit_amount);

  return (
    <div className="animate-fade-in">
      <Header title="Budgets" subtitle="Monthly spending limits" />

      <div className="px-6 py-6 space-y-6">

        {/* Summary */}
        {budgets.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-accent-purple-light" />
                <p className="text-xs text-text-muted">Total Budgeted</p>
              </div>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalBudgeted)}</p>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-danger-DEFAULT" />
                <p className="text-xs text-text-muted">Total Spent (this month)</p>
              </div>
              <p className="text-2xl font-bold text-danger-light">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted mb-2">Over Budget</p>
              <p className={`text-2xl font-bold ${overBudget.length > 0 ? "text-danger-DEFAULT" : "text-success-DEFAULT"}`}>
                {overBudget.length} {overBudget.length === 1 ? "category" : "categories"}
              </p>
            </div>
          </div>
        )}

        {/* Over budget alert */}
        {overBudget.length > 0 && (
          <div className="bg-danger-muted border border-danger-DEFAULT/30 rounded-xl p-4">
            <p className="text-sm font-semibold text-danger-light mb-1">Over Budget</p>
            <p className="text-xs text-danger-light/70">
              {overBudget.map(b => b.category).join(", ")} exceeded the monthly limit.
            </p>
          </div>
        )}

        {/* Budget grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">
              {budgets.length === 0 ? "No budgets yet" : "Monthly Budgets"}
            </h2>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-accent-purple-light hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add budget
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <form onSubmit={handleCreate} className="bg-bg-card border border-border rounded-xl p-4 mb-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs text-text-muted mb-1 block">Category</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-purple/60"
                >
                  {CATEGORIES.filter(c => !budgets.find(b => b.category === c)).map(c => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div className="w-36">
                <label className="text-xs text-text-muted mb-1 block">Monthly limit ($)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 500"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-purple/60"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-gradient-purple text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-glow disabled:opacity-60 h-9"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {saving ? "Saving…" : "Create"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-secondary h-9 flex items-center">
                <X className="w-4 h-4" />
              </button>
            </form>
          )}

          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-bg-card border border-border rounded-xl">
              <Target className="w-10 h-10 text-text-disabled" />
              <p className="text-sm text-text-secondary">No budgets created yet</p>
              <p className="text-xs text-text-muted">Set a monthly limit per category to track your spending.</p>
              {!showForm && (
                <button onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 text-xs text-accent-purple-light hover:underline mt-1">
                  <Plus className="w-3 h-3" /> Add your first budget
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {budgets.map(b => (
                <div key={b.id} className="relative group">
                  <BudgetCard budget={b} />
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-text-muted hover:text-danger-DEFAULT"
                  >
                    {deletingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
