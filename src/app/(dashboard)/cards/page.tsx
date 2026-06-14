"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import BankCard from "@/components/cards/BankCard";
import ConnectBankButton from "@/components/plaid/ConnectBankButton";
import { formatCurrency } from "@/lib/utils";
import type { Account, Transaction } from "@/types";
import { CreditCard, Landmark, Wallet, PackageOpen, LayoutGrid } from "lucide-react";

function SectionHeader({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <h2 className="text-sm font-semibold text-text-primary">{label}</h2>
      <span className="text-xs text-text-muted bg-bg-elevated border border-border px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

export default function CardsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/plaid/accounts").then(r => r.json()),
      fetch("/api/transactions").then(r => r.json()),
    ]).then(([a, t]) => {
      setAccounts(a.accounts ?? []);
      setTransactions(t.transactions ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Header title="Cards & Accounts" subtitle="Loading…" />
        <div className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="bg-bg-card border border-border rounded-xl h-24 animate-pulse" />)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-bg-card border border-border rounded-xl h-48 animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="animate-fade-in">
        <Header title="Cards & Accounts" subtitle="No accounts linked" />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-text-muted" />
          </div>
          <div>
            <p className="text-base font-semibold text-text-secondary mb-1">No accounts linked yet</p>
            <p className="text-sm text-text-muted">Connect your bank to see your cards and accounts here.</p>
          </div>
          <ConnectBankButton />
        </div>
      </div>
    );
  }

  // Split accounts into groups
  const debitCards   = accounts.filter(a => a.type === "depository" && a.subtype === "checking");
  const bankAccounts = accounts.filter(a => a.type === "depository" && a.subtype !== "checking");
  const creditCards  = accounts.filter(a => a.type === "credit");
  const otherCards   = accounts.filter(a => a.type !== "depository" && a.type !== "credit");

  const totalAssets    = accounts.filter(a => a.type === "depository").reduce((s, a) => s + a.current_balance, 0);
  const totalCreditUsed = creditCards.reduce((s, a) => s + Math.abs(a.current_balance), 0);
  const totalCreditLimit = creditCards.reduce((s, a) => s + (a.credit_limit ?? 0), 0);
  const netWorth = totalAssets - totalCreditUsed;

  const summaryCards = [
    {
      label: "Total Accounts",
      value: accounts.length.toString(),
      sub: `${debitCards.length} debit · ${creditCards.length} credit${otherCards.length ? ` · ${otherCards.length} other` : ""}`,
      icon: <LayoutGrid className="w-4 h-4 text-accent-purple-light" />,
      bg: "bg-accent-purple/10",
      valueClass: "text-text-primary",
    },
    {
      label: "Debit Cards",
      value: debitCards.length.toString(),
      sub: debitCards.map(a => `•••• ${a.mask}`).join("  ") || "None linked",
      icon: <Wallet className="w-4 h-4 text-accent-blue" />,
      bg: "bg-accent-blue/10",
      valueClass: "text-text-primary",
    },
    {
      label: "Credit Cards",
      value: creditCards.length.toString(),
      sub: totalCreditLimit > 0 ? `${formatCurrency(totalCreditUsed)} used of ${formatCurrency(totalCreditLimit)}` : "None linked",
      icon: <CreditCard className="w-4 h-4 text-danger-light" />,
      bg: "bg-danger-muted",
      valueClass: "text-text-primary",
    },
    {
      label: "Total Assets",
      value: formatCurrency(totalAssets),
      sub: "Across all bank accounts",
      icon: <Landmark className="w-4 h-4 text-success-DEFAULT" />,
      bg: "bg-success-muted",
      valueClass: "text-success-DEFAULT",
    },
    {
      label: "Net Worth",
      value: formatCurrency(netWorth),
      sub: "Assets minus credit owed",
      icon: <Wallet className="w-4 h-4 text-accent-purple-light" />,
      bg: "bg-accent-purple/10",
      valueClass: netWorth >= 0 ? "text-success-DEFAULT" : "text-danger-DEFAULT",
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header title="Cards & Accounts" subtitle={`${accounts.length} account${accounts.length !== 1 ? "s" : ""} linked`} />

      <div className="px-6 py-6 space-y-6">

        {/* Summary row */}
        <div className="grid grid-cols-5 gap-4">
          {summaryCards.map(s => (
            <div key={s.label} className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-bright transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-text-muted">{s.label}</p>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${s.bg}`}>{s.icon}</div>
              </div>
              <p className={`text-xl font-bold ${s.valueClass}`}>{s.value}</p>
              <p className="text-[10px] text-text-disabled mt-0.5 truncate">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Debit Cards */}
        {debitCards.length > 0 && (
          <div>
            <SectionHeader
              icon={<Wallet className="w-3.5 h-3.5 text-accent-blue" />}
              label="Debit Cards"
              count={debitCards.length}
              color="bg-accent-blue/10"
            />
            <div className="grid grid-cols-2 gap-4">
              {debitCards.map(a => <BankCard key={a.id} account={a} />)}
            </div>
          </div>
        )}

        {/* Credit Cards */}
        {creditCards.length > 0 && (
          <div>
            <SectionHeader
              icon={<CreditCard className="w-3.5 h-3.5 text-danger-light" />}
              label="Credit Cards"
              count={creditCards.length}
              color="bg-danger-muted"
            />
            <div className="grid grid-cols-2 gap-4">
              {creditCards.map(a => <BankCard key={a.id} account={a} />)}
            </div>
          </div>
        )}

        {/* Bank Accounts (savings, etc.) */}
        {bankAccounts.length > 0 && (
          <div>
            <SectionHeader
              icon={<Landmark className="w-3.5 h-3.5 text-success-DEFAULT" />}
              label="Bank Accounts"
              count={bankAccounts.length}
              color="bg-success-muted"
            />
            <div className="grid grid-cols-2 gap-4">
              {bankAccounts.map(a => <BankCard key={a.id} account={a} />)}
            </div>
          </div>
        )}

        {/* Other (loans, investments, etc.) */}
        {otherCards.length > 0 && (
          <div>
            <SectionHeader
              icon={<PackageOpen className="w-3.5 h-3.5 text-text-muted" />}
              label="Other Accounts"
              count={otherCards.length}
              color="bg-bg-elevated"
            />
            <div className="grid grid-cols-2 gap-4">
              {otherCards.map(a => <BankCard key={a.id} account={a} />)}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {transactions.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-3">Recent Activity</h2>
            <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
              {/* Per-account breakdown header */}
              <div className="grid grid-cols-4 border-b border-border">
                {accounts.slice(0, 4).map(a => {
                  const acctTxns = transactions.filter(t => t.accountId === a.accountId);
                  const spent = acctTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
                  return (
                    <div key={a.id} className="px-4 py-3 border-r border-border last:border-r-0">
                      <p className="text-[10px] text-text-muted truncate">{a.name}</p>
                      <p className="text-xs font-semibold text-text-primary mt-0.5">
                        {formatCurrency(Math.abs(a.current_balance))}
                      </p>
                      <p className="text-[10px] text-text-muted">{acctTxns.length} txns · {formatCurrency(spent)} spent</p>
                    </div>
                  );
                })}
              </div>

              {/* Transaction list */}
              <div className="divide-y divide-border/50">
                {transactions.slice(0, 10).map(t => {
                  const account = accounts.find(a => a.accountId === t.accountId);
                  return (
                    <div key={t.id} className="flex items-center gap-4 px-4 py-3 hover:bg-bg-elevated transition-colors">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                        style={{ backgroundColor: (account?.institution_color ?? "#7c3aed") + "20" }}
                      >
                        {account?.institution_name?.charAt(0) ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">{t.merchant_name || t.name}</p>
                        <p className="text-[11px] text-text-muted mt-0.5 truncate">
                          {account?.name ?? "—"} · {t.primary_category} · {t.date}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-semibold ${t.amount < 0 ? "text-success-DEFAULT" : "text-text-primary"}`}>
                          {t.amount < 0 ? "+" : "-"}{formatCurrency(Math.abs(t.amount))}
                        </p>
                        <p className="text-[10px] text-text-muted capitalize">{t.payment_channel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
