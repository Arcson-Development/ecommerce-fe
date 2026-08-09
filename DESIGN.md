---
name: EKRAF Kiosk
description: Marketplace ekonomi kreatif Kemenkraf — sky-blue, terang, ramah kiosk publik
colors:
  primary: "#6fb6e2"
  primary-hover: "#559ed0"
  primary-fg: "#0b3a5c"
  primary-soft: "#eaf4fc"
  primary-soft-fg: "#155e93"
  accent: "#f59e0b"
  accent-hover: "#d97706"
  accent-fg: "#ffffff"
  accent-soft: "#fffbeb"
  sale: "#e11d48"
  success: "#16a34a"
  danger: "#dc2626"
  ink: "#18181b"
  muted-ink: "#52525b"
  line: "#e4e4e7"
  background: "#ffffff"
typography:
  display:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-fg}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.primary-fg}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    typography: "{typography.label}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "#5c3a05"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    typography: "{typography.label}"
  button-ghost:
    backgroundColor: "#ffffff"
    textColor: "{colors.primary-soft-fg}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    typography: "{typography.label}"
  chip-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-fg}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
    typography: "{typography.label}"
  chip-unselected:
    backgroundColor: "#f4f4f5"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px"
  text-body:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  text-muted:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted-ink}"
    typography: "{typography.body}"
  divider:
    backgroundColor: "{colors.line}"
    height: "1px"
  page-surface:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
  badge-sale:
    backgroundColor: "{colors.sale}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    typography: "{typography.label}"
  success-text:
    backgroundColor: "{colors.background}"
    textColor: "#15803d"
  danger-text:
    backgroundColor: "{colors.background}"
    textColor: "{colors.danger}"
  hero-surface:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-soft-fg}"
  accent-button-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "#5c3a05"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    typography: "{typography.label}"
  chip-accent-soft:
    backgroundColor: "{colors.accent-soft}"
    textColor: "#96610a"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    typography: "{typography.label}"
  progress-step-done:
    backgroundColor: "{colors.success}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.full}"
    size: "32px"
  progress-step-current:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-fg}"
    rounded: "{rounded.full}"
    size: "32px"
  progress-step-todo:
    backgroundColor: "#e4e4e7"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.full}"
    size: "32px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  search-input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  empty-state:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "40px"
---

# Design System: EKRAF Kiosk

## Overview

**Creative North Star: "Panggung Karya Nusantara"** *(proposed — revisable)*

EKRAF Kiosk adalah panggung terang untuk karya ekonomi kreatif Indonesia: langit biru cerah (`#6fb6e2`) sebagai panggung yang menenangkan, amber hangat (`#f59e0b`) sebagai sorotan yang mengundang aksi. Sistem ini sengaja dibuat **terang, lapang, dan ramah publik** — bukan toko online yang padat, melainkan etalase yang mengajak orang berhenti dan menyentuh.

Personality: **cerah dan percaya diri, tanpa berteriak**. Density rendah-sedang — kiosk 43" harus mudah dipindai dari jarak 1–2 m, jadi ruang kosong adalah fitur, bukan kemewahan. Teks navy di atas langit biru memberi keterbacaan tinggi tanpa kehilangan kehangatan.

Key Characteristics:
- **Langit biru sebagai rumah** — primary `#6fb6e2` ada di surfaces utama (TopBar, tombol, chip aktif), bukan sekadar aksen
- **Amber sebagai sorotan** — hanya untuk aksi/deals, tidak pernah mengisi permukaan besar
- **Flat dengan kedalaman halus** — kartu terangkat lewat tonal layering & shadow ringan, bukan bayangan dramatis
- **Bentuk ramah** — radius 10px di tombol, 16px di kartu, chip pill; tidak ada sudut tajam
- **Tipografi Geist** — sans geometris modern, tegas untuk judul, ringan untuk body

## Colors

Palet "langit sore yang cerah": biru menenangkan di bawah, amber hangat sebagai kontras, navy sebagai tinta teks.

### Primary
- **Langit Cerah** (`#6fb6e2`): permukaan brand & aksi utama — TopBar, tombol primer, chip terpilih. Terang tapi ramah.
- **Langit Dalam** (`#559ed0`): hover tombol primer. Satu langkah lebih dalam dari Langit Cerah.
- **Tinta Laut** (`#0b3a5c`): teks di atas Langit Cerah. Navy gelap menjamin kontras AA/AAA — teks putih akan gagal di permukaan terang ini.
- **Embun Langit** (`#eaf4fc`): permukaan lembut — latar Hero, section alt. Biru langit di tingkat 50.
- **Tinta Langit** (`#155e93`): teks judul di atas Embun Langit.

### Secondary (omitted — sistem ini satu aksen + neutral)

### Tertiary (omitted)

### Neutral
- **Tinta** (`#18181b`): teks utama di atas putih.
- **Tinta Redup** (`#52525b`): teks sekunder, label, deskripsi (AA di putih).
- **Garis** (`#e4e4e7`): border, divider.
- **Putih** (`#ffffff`): permukaan kartu & latar utama.

### Named Rules
**The Sky-As-Home Rule.** Primary `#6fb6e2` adalah rumah, bukan aksen — ia memenuhi permukaan brand (TopBar, tombol primer, chip aktif). Jangan menurunkannya jadi garis tepi tipis.
**The Amber Spotlight Rule.** Amber `#f59e0b` maksimal pada elemen aksi & deal (≤10% layar). Rarity-nya yang membuatnya menarik — jangan isi background dengan amber.
**The Navy-On-Sky Rule.** Teks di atas `#6fb6e2` selalu `#0b3a5c`, tidak pernah putih (kontras 2:1 gagal AA).

## Typography

**Display Font:** Geist (system-ui, -apple-system, sans-serif)
**Body Font:** Geist (system-ui, -apple-system, sans-serif)
**Label/Mono Font:** Geist Mono (fallback mono)

**Character:** Geometris modern yang netral dan percaya diri — seperti huruf di rambu kiosk publik: jelas dari jauh, tidak menuntut perhatian dengan hiasan. Pasangan sans-tunggal menjaga kesederhanaan; mono dipakai untuk hal teknis (harga, kode).

### Hierarchy
- **Display** (700, `clamp(1.875rem→3rem)`, 1.1, `-0.02em`): Judul hero — satu-satunya penggunaan sebesar ini.
- **Headline** (600, `clamp(1.25rem→1.5rem)`, 1.25): Judul section & judul produk.
- **Title** (600, 1rem, 1.4): Nama produk di kartu, nama menu admin.
- **Body** (400, 0.875rem, 1.6): Teks utama & deskripsi.
- **Label** (500, 0.75rem, `0.08em`, uppercase): Tombol, chip, breadcrumb — huruf kapital jarak lebar untuk elemen kecil.

### Named Rules
**The Kiosk Legibility Rule.** Ukuran teks minimum untuk konten kiosk adalah 0.875rem di web; judul hero jangan di bawah 1.875rem. Kiosk dibaca dari 1–2 m — legibility menang atas density.

## Layout

Kontainer maksimum `max-w-7xl` (80rem) dengan padding responsif `px-4` → `px-6` → `px-8`. Grid produk 4 kolom di desktop (12 kolom Tailwind, kartu 3 per baris pada `lg`), 2 kolom tablet, 1 kolom mobile.

Rhythm: 8px-based spacing scale (`xs 8 / sm 12 / md 16 / lg 24 / xl 32`). Section vertical padding `py-10` → `py-14` pada breakpoint besar. Header sticky dengan backdrop-blur `bg-white/95`.

Bar navigasi subsektor: horizontal scroll (`overflow-x-auto`, `scrollbar-hide`) — pill chip yang bisa digulir, cocok untuk 17 subsektor di layar kiosk.

## Elevation & Depth

Sistem **flat-dengan-kedalaman-halus**: permukaan terangkat melalui tonal layering dan bayangan ringan, bukan bayangan dramatis. Ini menjaga kiosk tetap terang dan mudah dibaca.

- **Shadow halus** (`shadow-sm`): kartu produk & kartu admin saat istirahat.
- **Shadow sedang** (`shadow-md`): kartu saat hover, dropdown, modal.
- **Tonal layering**: chip unselected `bg-zinc-100` di atas putih — kedalaman dicapai dengan perbedaan nilai, bukan bayangan.

### Named Rules
**The Flat-By-Default Rule.** Permukaan datar saat istirahat; bayangan muncul sebagai respons state (hover, focus). Kiosk yang terang tidak butuh drama.

## Shapes

Bentuk ramah, tidak tajam: radius dasar 10px (`--radius: 0.625rem`) untuk tombol & input, 16px untuk kartu, pill (9999px) untuk chip/badge. Border 1px `zinc-200` di input & divider. Tidak ada klip sudut, tidak ada silhouette kustom.

## Components

### Buttons
- **Shape:** Radius 10px, label uppercase tracking-widest, padding 12×20px.
- **Primary:** Langit Cerah (`#6fb6e2`) + Tinta Laut (`#0b3a5c`). Hover: Langit Dalam (`#559ed0`).
- **Accent:** Amber (`#f59e0b`) + putih — hanya untuk aksi transaksi/CTA utama (bayar, beli).
- **Ghost:** putih + border `primary/30`, teks Tinta Langit — aksi sekunder.
- **Hover/Focus:** `transition-colors` 150–200ms; focus ring `border-accent` untuk input, tombol memakai perubahan background.

### Chips
- **Style:** Pill radius penuh, label uppercase 12px.
- **State:** Terpilih = Langit Cerah + Tinta Laut; tidak terpilih = `zinc-100` + Tinta Redup. Hover tidak terpilih → `zinc-200`.

### Cards
- **Corner Style:** Radius 16px.
- **Background:** Putih, dengan shadow-sm saat istirahat.
- **Shadow Strategy:** Shadow halus; naik ke shadow-md saat hover (produk).
- **Internal Padding:** 16px (spacing-md).

### Inputs / Fields
- **Style:** Border `zinc-300`, background `#fafafa`, radius 10px.
- **Focus:** `focus:border-accent` + `focus:bg-white` — border berubah ke amber, bukan glow.
- **Error:** Pesan error `text-red-600` di bawah field.

### Navigation
- **Header:** Sticky putih `bg-white/95 backdrop-blur`, logo EKRAF kiri, search tengah, aksi kanan (Admin, Keranjang). Link hover `text-accent`.
- **SubsectorNav:** Bar zinc-50, pill chip horizontal scroll, teks uppercase. Aktif = chip primary; hover `text-accent-hover`.
- **Progress stepper (kiosk):** 4 langkah (Kategori → Wilayah → Produk → Bayar) di bawah header — lingkaran 32px; done = `bg-success text-white` ✓, current = `bg-primary text-primary-fg`, todo = `bg-zinc-200 text-muted-ink`; connector bar hijau saat selesai.
- **Toast:** overlay `bg-ink text-white` pill, muncul 2.2s saat produk ditambahkan ke keranjang (feedback tap di layar sentuh).
- **Empty state:** kartu putih + ikon 64px `text-muted-ink`, judul + subteks + CTA (dipakai: keranjang kosong, produk tidak ada).
- **Search box (step region):** kartu putih dengan ikon Search `text-muted-ink`, input transparan `text-lg`, filter live daftar provinsi/kota.
- **Admin sidebar:** Flat zinc-50, item aktif `bg-primary text-primary-fg` (Sky-as-Home), hover `text-primary hover:bg-primary-soft`. Logout & aksi destructive memakai `text-danger` / `bg-danger/10`. Stat cards: `bg-primary text-primary-fg` (positif) / `bg-danger text-white` (negatif).

## Do's and Don'ts

### Do:
- **Do** pakai `#6fb6e2` sebagai permukaan brand utama — TopBar, tombol primer, chip aktif.
- **Do** pakai Tinta Laut `#0b3a5c` untuk teks di atas Langit Cerah.
- **Do** batasi amber pada aksi & deal — sorotan, bukan background.
- **Do** pertahankan radius ramah (10px tombol, 16px kartu, pill chip).
- **Do** jaga jarak baca kiosk: teks ≥0.875rem, judul hero ≥1.875rem.

### Don't:
- **Don't** pakai warna di luar token `globals.css` — semua warna lewat `--color-*` tokens (no hardcoded `orange-*`, `green-*`, dst).
- **Don't** teks putih di atas `#6fb6e2` (gagal AA) — selalu navy.
- **Don't** menghidupkan kembali branding "Pasar Jaya" — nama, warna, atau mock data sayuran.
- **Don't** pakai shadow dramatis — sistem flat dengan kedalaman halus.
- **Don't** menaruh amber pada permukaan luas (mis. background section penuh).
