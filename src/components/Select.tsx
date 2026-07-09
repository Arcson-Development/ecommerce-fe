"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

interface SelectProps {
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  open: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
}

export function Select({
  value,
  placeholder,
  options,
  disabled,
  open,
  onToggle,
  onSelect,
}: SelectProps) {
  const [focusIndex, setFocusIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setFocusIndex(0);
      const timer = setTimeout(() => listRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setFocusIndex(-1);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (open && focusIndex >= 0 && options[focusIndex]) {
            onSelect(options[focusIndex]);
          } else {
            onToggle();
          }
          break;
        case "Escape":
          e.preventDefault();
          onToggle();
          triggerRef.current?.focus();
          break;
        case "Tab":
          onToggle();
          break;
      }
    },
    [open, focusIndex, options, onSelect, onToggle],
  );

  const optionEls = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (open && focusIndex >= 0) {
      optionEls.current[focusIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [open, focusIndex]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={placeholder}
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
            aria-hidden="true"
          />
          <motion.ul
            ref={listRef}
            role="listbox"
            aria-label={placeholder}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto border border-zinc-200 bg-white shadow-lg"
          >
            {options.map((opt, i) => (
              <li
                key={opt}
                ref={(el) => { optionEls.current[i] = el; }}
                role="option"
                aria-selected={opt === value}
              >
                <button
                  type="button"
                  onClick={() => onSelect(opt)}
                  onMouseEnter={() => setFocusIndex(i)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                    i === focusIndex ? "bg-zinc-100" : ""
                  } ${
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
