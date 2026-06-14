"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, DollarSign, Calendar, Tag, Building2, CreditCard, FileText, CheckCircle2 } from "lucide-react";
import { CATEGORY_COLORS, CATEGORY_ICONS, cn } from "@/lib/utils";
import type { Account } from "@/types";

const CATEGORIES = [
  "Food and Drink", "Shopping", "Transportation", "Entertainment",
  "Healthcare", "Travel", "Utilities", "Housing", "Education", "Personal", "Other",
];

const EMPTY_FORM = {
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  name: "",
  merchantName: "",
  primaryCategory: "Food and Drink",
  paymentChannel: "in store" as "online" | "in store" | "other",
  accountId: "manual",
  notes: "",
  isIncome: false,
};

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onAdded?: (tx?: Record<string, unknown>) => void;
}

export default function AddTransactionModal({ open, onClose, onAdded }: AddTransactionModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/plaid/accounts")
        .then(r => r.json())
        .then(d => setAccounts(d.accounts ?? []));
    }
  }, [open]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const firstInput = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.name) {
      setError("Amount and description are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: form.isIncome ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      setSuccess(true);
      onAdded?.(data.transaction);

      setTimeout(() => {
        setSuccess(false);
        setForm(EMPTY_FORM);
        onClose();
      }, 1200);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );

  const inputClass = "w-full bg-bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-purple/60 focus:ring-1 focus:ring-accent-purple/20 transition-all placeholder:text-text-muted";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-bg-card border border-border rounded-2xl w-full max-w-lg shadow-card-hover pointer-events-auto animate-slide-up">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Add Transaction</h2>
              <p className="text-xs text-text-muted mt-0.5">Manually record a payment or income</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-full bg-success-muted flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-success-DEFAULT" />
              </div>
              <p className="text-base font-semibold text-text-primary">Transaction added!</p>
              <p className="text-xs text-text-muted">Closing automatically…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Type toggle */}
              <div className="flex items-center gap-1 p-1 bg-bg-elevated border border-border rounded-xl">
                {[{ label: "Expense", value: false }, { label: "Income", value: true }].map(opt => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isIncome: opt.value }))}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      form.isIncome === opt.value
                        ? opt.value
                          ? "bg-success-muted text-success-DEFAULT border border-success-DEFAULT/30"
                          : "bg-danger-muted text-danger-light border border-danger-DEFAULT/30"
                        : "text-text-muted hover:text-text-secondary"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Amount + date row */}
              <div className="grid grid-cols-2 gap-3">
                {field("Amount", <DollarSign className="w-3.5 h-3.5" />,
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input
                      ref={firstInput}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      className={cn(inputClass, "pl-7")}
                      required
                    />
                  </div>
                )}
                {field("Date", <Calendar className="w-3.5 h-3.5" />,
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className={inputClass}
                    required
                  />
                )}
              </div>

              {/* Description */}
              {field("Description", <FileText className="w-3.5 h-3.5" />,
                <input
                  type="text"
                  placeholder="e.g. Grocery run, Freelance payment…"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  required
                />
              )}

              {/* Merchant */}
              {field("Merchant (optional)", <Building2 className="w-3.5 h-3.5" />,
                <input
                  type="text"
                  placeholder="e.g. Whole Foods, Stripe…"
                  value={form.merchantName}
                  onChange={e => setForm(f => ({ ...f, merchantName: e.target.value }))}
                  className={inputClass}
                />
              )}

              {/* Category + payment channel */}
              <div className="grid grid-cols-2 gap-3">
                {field("Category", <Tag className="w-3.5 h-3.5" />,
                  <select
                    value={form.primaryCategory}
                    onChange={e => setForm(f => ({ ...f, primaryCategory: e.target.value }))}
                    className={cn(inputClass, "cursor-pointer")}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                  </select>
                )}
                {field("Method", <CreditCard className="w-3.5 h-3.5" />,
                  <select
                    value={form.paymentChannel}
                    onChange={e => setForm(f => ({ ...f, paymentChannel: e.target.value as typeof form.paymentChannel }))}
                    className={cn(inputClass, "cursor-pointer")}
                  >
                    <option value="in store">In Store</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </select>
                )}
              </div>

              {/* Account */}
              {field("Account", <CreditCard className="w-3.5 h-3.5" />,
                <select
                  value={form.accountId}
                  onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
                  className={cn(inputClass, "cursor-pointer")}
                >
                  <option value="manual">Manual entry</option>
                  {accounts.map(a => (
                    <option key={a.accountId} value={a.accountId}>
                      {a.institution_name} •••• {a.mask} ({a.type})
                    </option>
                  ))}
                </select>
              )}

              {/* Notes */}
              {field("Notes (optional)", <FileText className="w-3.5 h-3.5" />,
                <textarea
                  placeholder="Any extra context…"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className={cn(inputClass, "resize-none")}
                />
              )}

              {/* Category preview */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border"
                style={{ backgroundColor: CATEGORY_COLORS[form.primaryCategory] + "12" }}
              >
                <span className="text-lg">{CATEGORY_ICONS[form.primaryCategory] || "📦"}</span>
                <div>
                  <p className="text-xs font-medium text-text-primary">{form.primaryCategory}</p>
                  <p className="text-[10px] text-text-muted">Category selected</p>
                </div>
                {form.amount && (
                  <div className="ml-auto text-right">
                    <p className={cn("text-sm font-bold", form.isIncome ? "text-success-DEFAULT" : "text-danger-DEFAULT")}>
                      {form.isIncome ? "+" : "-"}${parseFloat(form.amount || "0").toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-xs text-danger-DEFAULT bg-danger-muted px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {loading ? "Saving…" : "Add Transaction"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
