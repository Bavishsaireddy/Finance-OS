"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { DayPoint } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

interface DayOfWeekChartProps {
  data: DayPoint[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-bg-card border border-border rounded-xl px-4 py-3 shadow-card">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="text-lg font-bold text-text-primary mt-1">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const max = Math.max(...data.map(d => d.amount));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={32}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262637" vertical={false} />
        <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill="#7c3aed"
              fillOpacity={max > 0 ? 0.3 + (d.amount / max) * 0.7 : 0.4}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
