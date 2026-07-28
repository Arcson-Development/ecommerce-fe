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
	loading?: boolean;
	open: boolean;
	onToggle: () => void;
	onSelect: (v: string) => void;
}

export function SelectInput(props: SelectInputProps) {
	if (props.loading) {
		return (
			<div className="flex w-full items-center gap-2 border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-400">
				<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					/>
				</svg>
				<span>Memuat...</span>
			</div>
		);
	}
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
