"use client";

import { useCallback, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";

interface ConnectBankButtonProps {
  className?: string;
}

export default function ConnectBankButton({ className }: ConnectBankButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const fetchLinkToken = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/plaid/create-link-token", { method: "POST" });
      if (!res.ok) throw new Error("Could not create link token");
      const { link_token } = await res.json();
      setLinkToken(link_token);
    } catch (e) {
      setError("Failed to start bank connection. Check your Plaid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = useCallback(async (public_token: string, metadata: { institution: { name: string; institution_id: string } | null }) => {
    setSyncing(true);
    try {
      await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token, institution: metadata.institution }),
      });
      await fetch("/api/plaid/transactions", { method: "POST" });
      setDone(true);
      setLinkToken(null);
      setTimeout(() => { setDone(false); window.location.reload(); }, 1500);
    } catch {
      setError("Bank connected but failed to sync transactions. Try again.");
    } finally {
      setSyncing(false);
    }
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess,
  });

  const handleClick = async () => {
    if (linkToken && ready) {
      open();
    } else {
      await fetchLinkToken();
    }
  };

  // Auto-open Plaid Link once we have the token
  if (linkToken && ready) {
    open();
  }

  if (done) {
    return (
      <button disabled className={`flex items-center gap-1.5 bg-success-DEFAULT text-white text-xs font-medium px-3 py-2 rounded-lg ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        Connected!
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading || syncing}
        className={`flex items-center gap-1.5 bg-gradient-purple text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-glow disabled:opacity-60 ${className}`}
      >
        {loading || syncing
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Plus className="w-3.5 h-3.5" />
        }
        {syncing ? "Syncing…" : loading ? "Opening…" : "Connect Bank"}
      </button>
      {error && <p className="text-[10px] text-danger-DEFAULT max-w-48 text-right">{error}</p>}
    </div>
  );
}
