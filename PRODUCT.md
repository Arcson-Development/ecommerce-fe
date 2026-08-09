# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Pengunjung kiosk (primer)**: orang di depan kiosk fisik 43" dual-screen di area publik Kemenkraf (mall/event/gedung). Situasi: berdiri 1–2 m dari layar, menyentuh layar sentuh, tidak mau login, keputusan cepat. Job: menemukan produk ekonomi kreatif dan memesan/membayar dalam hitungan menit.
- **Admin kiosk (operator CMS)**: staf yang mengelola katalog — subsektor, toko/mitra, produk, iklan display. Akses via web browser (login `/admin/login`).
- **Mitra/toko (pelaku kreatif)**: mendaftar & mengelola toko dan produk. Register/login utama via aplikasi mobile (tim Pak Toha, di luar repo ini) — web hanya menyajikan produk.
- **Tim Flutter (Pak Toha)**: konsumen API — butuh endpoint stabil + dokumentasi (Postman), bukan UI web.

## Product Purpose

Marketplace ekonomi kreatif Indonesia yang dioperasikan lewat **kiosk fisik dual-screen** (Layar A interaktif, Layar B iklan). Pembeli menjelajah 17 subsektor resmi Kemenkraf → memilih daerah → produk → toko → bayar QRIS. Sukses = transaksi kiosk berjalan lancar tanpa pendampingan, katalog selalu segar, dan kiosk menarik perhatian saat idle (display loop).

## Positioning

Kiosk fisik kurasi Kemenkraf dengan 17 subsektor ekonomi kreatif resmi + data wilayah resmi (38 provinsi, 514 kota/kabupaten) — kombinasi yang tidak bisa ditiru marketplace online biasa. Produk melalui kurasi, pembayaran QRIS, pengiriman terintegrasi (Biteship aktif, KiriminAja menyusul).

## Operating Context

- **Kiosk 43" dual-screen**: Layar A `/kiosk` (wizard touch: subsektor → daerah → produk → toko → QRIS), Layar B `/display` (loop iklan image/video, `duration_seconds`).
- **Idle 60 detik** di kiosk → auto ke display; sentuh display → balik ke kiosk.
- Register/login **buyer tidak ada di web** (kiosk tanpa login) — berada di aplikasi mobile. Web hanya punya login admin (`/admin/login`).
- Admin CMS: dashboard, kelola subsektor, toko, produk, iklan, pengiriman, pembayaran.
- Deploy produksi: FE `101.50.2.190:6079`, BE `101.50.2.190:6080/api`, DB Postgres `ekraf_kiosk` (54320), PM2 + systemd.

## Capabilities and Constraints

- **Fitur**: katalog produk per subsektor/daerah, keranjang, checkout, pembayaran QRIS (DOKU sandbox aktif; produksi menunggu KYB), pengiriman Biteship (rates berbayar — saldo 0), iklan display, CMS admin, API untuk mobile app.
- **17 subsektor Kemenkraf** (schema fleksibel, seed resmi), **38 provinsi + 514 kota** dari API emsifa.
- **Auth**: `register-buyer` (phone+password) & `register-store` (syarat BUYER, dokumen NIB+KBLI wajib) — endpoint untuk mobile app.
- **Stack**: Next.js 16 (App Router, Turbopack) + Tailwind CSS v4 (CSS-first `@theme`); BE NestJS 11 + Prisma 6.6 (JANGAN 7) + PostgreSQL. Monorepo `ekraf-kiosk` (FE + BE).
- **Teknis terikat**: token desain di `src/app/globals.css` (`:root` + `@theme inline`); API prefix `/api`; login BE pakai email/username; body order snake_case.
- **Belum diputuskan/dikembangkan**: route `/kiosk` dan `/display` (inti kiosk) belum ada di FE — masih template marketplace (landing, checkout, product, mitra). Payment produksi (DOKU) menunggu KYB. Saldo Biteship 0 (rates berbayar). Upload gambar produk/iklan belum ada (CMS pakai URL eksternal).

## Brand Commitments

- Nama: **EKRAF Kiosk** (Kemenkraf). Bukan "Pasar Jaya" — branding lama dilarang dipakai ulang.
- Logo: `public/ekraf-logo.png` (dipakai di Header + favicon) — dari aset resmi pos-sms.
- **Warna terikat (dari user, binding)**: primary `#6fb6e2` (sky blue) + palette turunannya (accent amber `#f59e0b`, fg navy `#0b3a5c`, soft sky `#eaf4fc`) — didefinisikan di `globals.css` sebagai design tokens.
- Voice: Indonesia (formal-padat untuk kiosk, ramah untuk display).
- Subsektor = istilah resmi Kemenkraf; "pasar" (lokasi fisik) bukan konsep yang dipakai di web.

## Evidence on Hand

- `../ekraf-kiosk-be/docs/FLOW.md` — alur lengkap (auth, produk, order, payment, shipping) untuk tim mobile.
- `../ekraf-kiosk-be/docs/EKRAF_Kiosk_API.postman_collection.json` — koleksi endpoint API.
- Obsidian vault: `D:\Mine\Obsidian-Vault\Notes\Projects\EKRAF Kiosk - Marketplace Kemenkraf.md`, `EKRAF Kiosk - Deploy Produksi.md`, `EKRAF Kiosk - Riset API Pengiriman.md`.
- Seed data: 17 subsektor Kemenkraf, 38 provinsi + 514 kota (API emsifa), admin seed `admin@ekraf.local`/`admin123` (ganti produksi).
- DOKU sandbox: Client ID `BRN-0209-1770465952957`, Secret `SK-p5qm9hwwbzQMg0tjJblW` (aktif, QRIS test OK di BE).
- **Belum ada** (jangan difabrikasi): testimoni pelanggan, statistik transaksi riil, logo di luar `ekraf-logo.png`, konten iklan display.

## Product Principles

1. **Kiosk-first**: layar 43" touch, jarak pandang 1–2 m, tanpa login — setiap keputusan desain harus memperbesar keterbacaan dan memperpendek langkah sentuh.
2. **Dual-screen bukan afterthought**: idle → display (menarik), sentuh → kiosk (transaksi) adalah ritme inti.
3. **Satu sumber token**: semua warna/shape/spacing di `globals.css` tokens — halaman tidak boleh punya warna hardcoded di luar token.
4. **Konten resmi > konten tiruan**: 17 subsektor & 514 wilayah resmi; jangan pamerkan data pasar-jaya atau produk placeholder sebagai nyata.
5. **API untuk mobile adalah first-class citizen**: endpoint + dokumentasi sama pentingnya dengan UI kiosk (tim Pak Toha mengkonsumsi API).

## Accessibility & Inclusion

- Kiosk publik: teks besar, kontras tinggi (target WCAG AA minimal; primary terang `#6fb6e2` wajib pakai fg navy untuk kontras), target sentuh minimal ~48px.
- Semua pengguna termasuk yang tidak terbiasa teknologi; tidak ada asumsi login/akun di kiosk.
- (Ditetapkan dalam sesi init 2026-08-03 — disimpulkan dari konteks kiosk fisik, bukan dari dokumen eksplisit.)
