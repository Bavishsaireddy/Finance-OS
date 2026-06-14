"use client";

import { Account } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Landmark } from "lucide-react";

interface BankCardProps {
  account: Account;
  compact?: boolean;
}

export default function BankCard({ account, compact = false }: BankCardProps) {
  const isCredit = account.type === "credit";
  const balance = account.current_balance;
  const creditLimit = account.credit_limit;
  const utilization = isCredit && creditLimit ? (Math.abs(balance) / creditLimit) * 100 : 0;
  const cardGradient = isCredit
    ? "from-[#1a1a2e] to-[#16213e]"
    : "from-[#0d1b2a] to-[#1a2742]";

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br ${cardGradient} border border-white/10 overflow-hidden shadow-card hover:shadow-card-hover transition-shadow`}
      style={{ borderLeftColor: account.institution_color, borderLeftWidth: 3 }}
    >
      {/* Background shimmer */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />

      <div className={compact ? "p-4" : "p-5"}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: account.institution_color + "30" }}
            >
              {isCredit
                ? <CreditCard className="w-4 h-4" style={{ color: account.institution_color }} />
                : <Landmark className="w-4 h-4" style={{ color: account.institution_color }} />
              }
            </div>
            <p className="text-sm font-semibold text-text-primary">{account.institution_name}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isCredit ? "bg-danger-muted text-danger-light" : "bg-success-muted text-success-light"}`}>
            {isCredit ? "Credit" : account.subtype}
          </span>
        </div>

        {/* Card number */}
        <p className="text-text-muted text-xs font-mono mb-1 tracking-widest">
          •••• •••• •••• {account.mask}
        </p>
        <p className="text-xs text-text-muted mb-4 truncate">{account.name}</p>

        {/* Balance */}
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">
            {isCredit ? "Balance Owed" : "Available Balance"}
          </p>
          <p className={`text-xl font-bold ${isCredit ? "text-danger-light" : "text-text-primary"}`}>
            {formatCurrency(Math.abs(balance))}
          </p>
        </div>

        {/* Credit utilization — only when not compact and is credit */}
        {isCredit && creditLimit && !compact && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-text-muted">Credit Used</span>
              <span className="text-[10px] font-semibold text-text-secondary">
                {utilization.toFixed(0)}% of {formatCurrency(creditLimit)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${utilization > 80 ? "bg-danger-DEFAULT" : utilization > 50 ? "bg-warning-DEFAULT" : "bg-success-DEFAULT"}`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
