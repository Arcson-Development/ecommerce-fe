"use client";

import {
  Smartphone,
  Building2,
  Sofa,
  Palette,
  Lightbulb,
  Shirt,
  Clapperboard,
  Camera,
  Gamepad2,
  Gem,
  UtensilsCrossed,
  Music,
  BookOpen,
  Megaphone,
  Theater,
  Paintbrush,
  Tv,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** Peta 17 subsektor ekonomi kreatif → ikon Lucide (SVG, konsisten di semua layar). */
const SUBSECTOR_ICONS: Record<string, LucideIcon> = {
  Aplikasi: Smartphone,
  Arsitektur: Building2,
  "Desain Interior": Sofa,
  "Desain Komunikasi Visual": Palette,
  "Desain Produk": Lightbulb,
  Fesyen: Shirt,
  "Film, Animasi & Video": Clapperboard,
  Fotografi: Camera,
  Gim: Gamepad2,
  Kriya: Gem,
  Kuliner: UtensilsCrossed,
  Musik: Music,
  Penerbitan: BookOpen,
  Periklanan: Megaphone,
  "Seni Pertunjukan": Theater,
  "Seni Rupa": Paintbrush,
  "Televisi & Radio": Tv,
};

/** Ikon subsektor dengan fallback Sparkles untuk nama tak dikenal. */
export function subsectorIcon(name?: string): LucideIcon {
  if (!name) return Sparkles;
  return SUBSECTOR_ICONS[name] ?? Sparkles;
}

/** Komponen ikon subsektor — pakai di kartu kategori & judul halaman. */
export default function SubsectorIcon({
  name,
  className,
  strokeWidth = 2,
}: {
  name?: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = subsectorIcon(name);
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
