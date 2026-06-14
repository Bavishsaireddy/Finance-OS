"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, BarChart3, Target, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/cards", label: "Cards", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 flex-shrink-0">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 shadow-glow" />
            {/* Inner symbol */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[15px] font-black text-white leading-none tracking-tighter select-none">₿</span>
            </div>
            {/* Glint */}
            <div className="absolute top-0.5 left-1 w-3 h-1 rounded-full bg-white/30 blur-[1px]" />
          </div>
          <div>
            <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 tracking-tight">
              FinanceOS
            </p>
            <p className="text-[10px] text-text-muted">Personal Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                active
                  ? "bg-warning-DEFAULT/10 text-warning-light border border-warning-DEFAULT/20"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-lg flex-shrink-0 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2e] to-[#0e0e12]" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="absolute inset-0 rounded-lg border border-white/15 ring-1 ring-inset ring-white/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[13px] font-black text-white tracking-tight leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {(process.env.NEXT_PUBLIC_USER_NAME ?? "U")[0]}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{process.env.NEXT_PUBLIC_USER_NAME ?? "You"} 👋</p>
            <p className="text-[10px] text-text-muted">Personal account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
