"use client";

import { useState, type ReactNode } from "react";
import { Select as SharedSelect } from "@/components/Select";

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

export function SelectInput(props: SelectInputProps) {
  return <SharedSelect {...props} />;
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
