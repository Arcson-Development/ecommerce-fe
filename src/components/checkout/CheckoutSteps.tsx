"use client";

import { motion } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";

interface Step {
  key: string;
  label: string;
}

interface CheckoutStepsProps {
  current: "cart" | "checkout" | "complete";
}

const STEPS: Step[] = [
  { key: "cart", label: "Shopping Chart" },
  { key: "checkout", label: "Checkout Details" },
  { key: "complete", label: "Order Complete" },
];

export function CheckoutSteps({ current }: CheckoutStepsProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto flex max-w-5xl items-center justify-center gap-3 px-4 py-8 sm:gap-4 sm:px-6"
    >
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.span
                animate={{
                  scale: isCurrent ? 1.05 : 1,
                }}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-zinc-900 text-white"
                      : "bg-gray-200 text-zinc-500"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </motion.span>
              <span
                className={`text-sm font-medium sm:text-base ${
                  isCurrent || isDone ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight
                className="h-4 w-4 text-zinc-300"
                strokeWidth={2}
              />
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
