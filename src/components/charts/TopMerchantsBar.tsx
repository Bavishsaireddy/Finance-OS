"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { MerchantItem } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

interface TopMerchantsBarProps {
  data: MerchantItem[];
}

const COLORS = [
  "#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ec4899",
  "#06b6d4", "#8b5cf6", "#ef4444",
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: MerchantItem; value: number }> }) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-bg-card border border-border rounded-xl px-4 py-3 shadow-card">
      <p className="text-sm font-medium text-text-primary">{payload[0].payload.name}</p>
      <p className="text-lg font-bold text-text-primary mt-1">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function TopMerchantsBar({ data }: TopMerchantsBarProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }} barSize={12}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262637" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={90}
          tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 11) + "…" : v}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
