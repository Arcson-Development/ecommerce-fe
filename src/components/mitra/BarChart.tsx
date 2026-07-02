"use client";

import { motion } from "framer-motion";

interface BarChartProps {
  data: { day: string; value: number }[];
}

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        return (
          <div
            key={d.day}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="hidden text-[10px] font-medium text-zinc-500 sm:inline">
              {(d.value / 1000).toFixed(0)}k
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${heightPct}%` }}
              transition={{
                delay: i * 0.08,
                duration: 0.6,
                ease: "easeOut",
              }}
              className="w-full rounded-t-sm bg-gradient-to-t from-zinc-900 to-zinc-600"
            />
            <span className="text-xs font-medium text-zinc-600">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}
