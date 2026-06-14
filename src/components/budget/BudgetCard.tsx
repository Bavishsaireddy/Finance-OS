"use client";

import { Budget } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BudgetCardProps {
  budget: Budget;
}

export default function BudgetCard({ budget }: BudgetCardProps) {
  const pct = budget.limit_amount > 0
    ? Math.min((budget.spent_amount / budget.limit_amount) * 100, 100)
    : 0;
  const over = budget.spent_amount > budget.limit_amount;
  const remaining = budget.limit_amount - budget.spent_amount;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-bright transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{budget.icon}</span>
          <div>
            <p className="text-sm font-semibold text-text-primary">{budget.category}</p>
            <p className="text-[10px] text-text-muted capitalize">{budget.period}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-sm font-bold", over ? "text-danger-DEFAULT" : "text-text-primary")}>
            {formatCurrency(budget.spent_amount)}
          </p>
          <p className="text-[10px] text-text-muted">of {formatCurrency(budget.limit_amount)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            over ? "bg-danger-DEFAULT" : pct > 80 ? "bg-warning-DEFAULT" : "bg-success-DEFAULT"
          )}
          style={{ width: `${pct}%`, backgroundColor: over ? undefined : budget.color }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-muted">{pct.toFixed(0)}% used</span>
        <span className={cn("text-[10px] font-medium", over ? "text-danger-DEFAULT" : "text-success-DEFAULT")}>
          {over
            ? `${formatCurrency(Math.abs(remaining))} over`
            : `${formatCurrency(remaining)} left`}
        </span>
      </div>
    </div>
  );
}
