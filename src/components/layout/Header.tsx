"use client";

import { Bell, Search } from "lucide-react";
import { useState } from "react";
import ConnectBankButton from "@/components/plaid/ConnectBankButton";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className={`flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 py-2 transition-all ${searchOpen ? "w-56" : "w-auto"}`}>
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            {searchOpen ? (
              <input
                autoFocus
                onBlur={() => setSearchOpen(false)}
                placeholder="Search transactions..."
                className="bg-transparent text-xs text-text-primary outline-none w-full placeholder:text-text-muted"
              />
            ) : (
              <button onClick={() => setSearchOpen(true)} className="text-xs text-text-muted">
                Search
              </button>
            )}
          </div>

          {/* Notifications */}
          <button className="relative w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-bright transition-all">
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-purple" />
          </button>

          <ConnectBankButton />
        </div>
      </div>
    </header>
  );
}
