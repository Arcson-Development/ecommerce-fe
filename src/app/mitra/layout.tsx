"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/**
 * Guard for all /mitra routes.
 * - Redirects unauthenticated users to /auth.
 * - Redirects authenticated non-MITRA users (buyers/admins) away from the
 *   seller panel so a regular buyer cannot reach seller-only screens.
 * Each mitra page renders its own MitraShell, so this layout only enforces
 * access and delegates rendering to the page.
 */
export default function MitraLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuth.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useAuth.persist.onFinishHydration(() => setHydrated(true));
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (user?.role !== "MITRA") {
      router.push("/");
      return;
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8 text-sm text-zinc-500">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "MITRA") {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8 text-sm text-zinc-500">
        Mengarahkan...
      </div>
    );
  }

  return <>{children}</>;
}
