"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-zinc-800">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

interface SelectInputProps {
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  open: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
}

export function SelectInput({
  value,
  placeholder,
  options,
  disabled,
  open,
  onToggle,
  onSelect,
}: SelectInputProps) {
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={`flex w-full items-center justify-between border bg-zinc-50 px-4 py-3 text-left text-sm transition-colors ${
          disabled
            ? "cursor-not-allowed border-zinc-200 text-zinc-400"
            : open
              ? "border-zinc-900 bg-white text-zinc-900"
              : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
        }`}
      >
        <span className={value ? "text-zinc-900" : "text-zinc-400"}>
          {value || placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </motion.span>
      </button>
      {open && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
          />
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto border border-zinc-200 bg-white shadow-lg"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => onSelect(opt)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                    opt === value
                      ? "bg-zinc-50 font-medium text-zinc-900"
                      : "text-zinc-700"
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
        </>
      )}
    </div>
  );
}

export function useSelectState(initial = false) {
  const [open, setOpen] = useState(initial);
  return {
    open,
    toggle: () => setOpen((o) => !o),
    close: () => setOpen(false),
  };
}

// Common input style
export const inputClass =
  "w-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400";
