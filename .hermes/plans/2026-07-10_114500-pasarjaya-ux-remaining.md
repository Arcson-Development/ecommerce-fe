# Pasar Jaya — Selesaikan Semua Temuan UX (Remaining + Final Verification)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Tuntaskan seluruh temuan adversarial UX yang masih terbuka (5 item YELLOW W1–W5) dan lakukan verifikasi final menyeluruh sehingga aplikasi bebas showstopper & friksi kritis.

**Architecture:** Frontend Next.js 16 (App Router, `"use client"` components, zustand stores `useCart`/`useAuth`/`useMitra`, `sonner` toasts, `framer-motion`). Backend remote `http://101.50.2.190:6670/api` (tidak bisa diubah dari local repo — local `ecommerce-be` tidak punya module cart). Semua perbaikan di sisi FE saja.

**Tech Stack:** Next.js 16, React 19, TypeScript, zustand (persist), Tailwind, lucide-react, sonner.

**Baseline (SUDAH DI-COMMIT — jangan ulangi):**
- `f61b3d6` T1/T2/T3/T5/T7/M1/M2/M3/M4/A1/A2/E1/E2/E3/E4 (cart Rp0 fix, checkout tab-baru, auth redirect, mitra guard, error boundaries, 401)
- `c601664` product 404 handling (notFound + pesan)
- `09636f4` cart item removal + double-click guard

---

## Open Items (akan dikerjakan)

| ID | Severity | Area | Masalah | Pendekatan |
|----|----------|------|---------|------------|
| W2 | 🟡 | Cart race | `fetchCart` `set({items})` menimpa optimistic local | Guard: jangan overwrite kalau ada mutasi pending; atau merge by variantId. |
| W3 | ⚪ | Breadcrumb | `href="#"` di Breadcrumb.tsx:49 & ProductBreadcrumb.tsx:26 | Ganti ke `href` valid atau `aria-disabled` (non-link). |
| W4 | ⚪ | Account guard | Account page tiada auth guard | Tambah redirect ke `/auth` kalau `!isAuthenticated` (mirip mitra layout). |
| W5 | ⚪ | OrderSummary race | Refetch `/cart` bisa stale kalau POST belum commit | Gunakan optimistic update lokal + sync, bukan refetch polos. |

**W1 (Admin Products CRUD) — SKIP / BY-DESIGN.** Admin products read-only karena produk dikelola mitra. Dicomment dari scope (konfirmasi user 2026-07-10).

---

## Task 1: Account page auth guard (W4)
**Objective:** Cegah akses halaman account kalau belum login (konsisten dgn admin/mitra).

**Files:** Modify `src/app/account/page.tsx`

**Step 1:** Tambahkan import `useAuth` (sudah ada di line 15) + `useRouter` + `useEffect` hydration guard.
**Step 2:** Di awal component, setelah `useAuth`:
```tsx
const router = useRouter();
const isAuthenticated = useAuth((s) => s.isAuthenticated);
const [hydrated, setHydrated] = useState(false);
useEffect(() => {
  if (useAuth.persist.hasHydrated()) setHydrated(true);
  else {
    const u = useAuth.persist.onFinishHydration(() => setHydrated(true));
    return () => u();
  }
}, []);
useEffect(() => {
  if (hydrated && !isAuthenticated) router.replace("/auth");
}, [hydrated, isAuthenticated, router]);
if (!hydrated) return <div className="py-16 text-center text-sm text-zinc-500">Memuat…</div>;
if (!isAuthenticated) return <div className="py-16 text-center text-sm text-zinc-500">Mengarahkan…</div>;
```
**Step 3:** Build verify `npm run build` → EXIT 0.
**Step 4:** Commit `git commit -m "fix(ux): guard account page for unauthenticated users"`

---

## Task 2: Breadcrumb non-link fix (W3)
**Objective:** Hilangkan `href="#"` yang bisa scroll ke atas / terlihat aneh.

**Files:** Modify `src/components/Breadcrumb.tsx:49`, `src/components/product/ProductBreadcrumb.tsx:26`

**Step 1:** Ganti `<a href="#">` terakhir (current page) menjadi `<span>` tanpa href, atau `aria-disabled="true"`.
**Step 2:** Build verify.
**Step 3:** Commit `git commit -m "fix(ux): remove dead href=# in breadcrumbs"`

---

## Task 3: Cart fetch-vs-optimistic race (W2)
**Objective:** `fetchCart` tidak menimpa item yang baru di-add secara optimistic sebelum POST selesai.

**Files:** Modify `src/lib/cart.ts` (`fetchCart` ~line 38-56, `addItem` sudah di line 58+)

**Step 1:** Tambahkan flag `syncing` di state:
```ts
interface CartState { items: CartItem[]; syncing: boolean; ... }
```
**Step 2:** Di `addItem`, set `syncing=true` sebelum await POST, `false` di finally. Di `fetchCart`, `if (get().syncing) return;` (skip overwrite saat ada mutasi berjalan).
**Step 3:** Build verify + lint (perhatikan `no-explicit-any` pre-existing — jangan introduce baru).
**Step 4:** Commit `git commit -m "fix(cart): prevent fetchCart overwrite during optimistic add"`

---

## Task 4: OrderSummary optimistic update (W5)
**Objective:** Kurangi/Hapus tidak refetch polos (stale race), pakai update lokal + sync.

**Files:** Modify `src/components/checkout/OrderSummary.tsx` (handler "Kurangi"/"Hapus" yg sudah ada di line ~150-195)

**Step 1:** Setelah `updateQuantity`/`removeItem` (sudah optimistic di cart store), **langsung update `cartDetails` local** dari `useCart.getState().items` bukan `await api.get("/cart")`.
```ts
await updateQuantity(variant.id, item.quantity - 1);
const local = useCart.getState().items;
// map local -> cartDetails shape (variant.price, dll) lalu setCartDetails(...)
```
**Step 2:** Build verify.
**Step 3:** Commit `git commit -m "fix(ux): cart mutations use optimistic local state, no stale refetch"`

---

## Task 5: Admin Products CRUD (W1) — KONDISIONAL
**Objective:** Beri admin kemampuan kelola produk (jika PM konfirmasi bukan by-design).

**Files:** Modify `src/app/admin/products/page.tsx` + mungkin `src/app/admin/products/[id]/page.tsx` (BARU)

**Step 1 (konfirmasi dulu):** Tanya user: "Admin produk memang read-only by-design (mitra yg kelola) atau perlu CRUD?" Jika by-design → **skip task ini**, catat di audit log.
**Step 2 (jika lanjut):** Tambah tombol "Tambah Produk" → modal/form dengan field name/description/price/stock/categoryId + unit (mirip `mitra/products/new`). Tambah edit & delete per card dengan `api.put/delete("/admin/products/:id")` + toast.
**Step 3:** Build verify.
**Step 4:** Commit `git commit -m "feat(admin): product create/edit/delete management"`

---

## Task 6: Final verification sweep
**Objective:** Pastikan tidak ada regresi & semua route build bersih.

**Step 1:** `npm run build` → harus EXIT 0 (39 routes).
**Step 2:** `npx eslint src/app src/components src/lib` → catat errors; pastikan TIDAK ADA error baru dari file yang kita ubah (pre-existing `no-explicit-any` di lib tidak dihitung).
**Step 3:** Review diff: `git diff main~3..HEAD --stat` → pastikan 11+ file tersentuh benar.
**Step 4:** Update `dev/PasarJaya-UX-Audit.md` → pindahkan W1–W5 dari "open" ke "done" (atau "by-design").
**Step 5:** Tanya user: push ke remote?

---

## Risiko & Tradeoff
- **W1** butuh keputusan PM — jangan asumsi. Default skip kalau by-design.
- **W2/W5** mengubah timing cart sync — test manual di browser asli (Chrome) perlu dilakukan user (browser tool terisolasi dari remote BE).
- Local `ecommerce-be` tidak punya cart module → tidak bisa jalankan E2E lokal tanpa Docker + DB remote. Verifikasi terbatas pada `next build` + curl ke remote.

## Validation Summary (expected)
- `npm run build` EXIT 0 di setiap task.
- Tidak ada lint error baru dari file yang diubah.
- Account guard: akses `/account` tanpa login → redirect `/auth`.
- Breadcrumb: tidak ada `href="#"`.
- Cart: add lalu fetchCart bersamaan tidak menghilangkan item.
