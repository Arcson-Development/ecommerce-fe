"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, MapPin, Store, FileText, Phone } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import {
  AccountSidebar,
  AccountLayoutHeader,
} from "@/components/account/AccountSidebar";
import { useMitra, MITRA_STATUS_META } from "@/lib/mitra";

export default function MitraDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const getApplication = useMitra((s) => s.getApplication);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const application = mounted ? getApplication(params.id) : undefined;

  if (!mounted) return null;
  if (!application) {
    return (
      <>
        <TopBar />
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-xl font-semibold text-zinc-900">
            Pengajuan tidak ditemukan
          </h1>
          <button
            onClick={() => router.push("/account/mitra")}
            className="mt-6 bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
          >
            Kembali
          </button>
        </main>
      </>
    );
  }

  const meta = MITRA_STATUS_META[application.status];

  return (
    <>
      <TopBar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/account/mitra")}
          className="mb-4 flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          Kembali ke daftar mitra
        </button>
        <AccountLayoutHeader title={`Pengajuan #${application.id}`} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="mitra" />

          <div className="space-y-4">
            {/* Status banner */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-sm border ${meta.bg} p-5`}
            >
              <p className={`text-xs uppercase tracking-wider ${meta.text}`}>
                Status Pengajuan
              </p>
              <p className={`mt-1 text-lg font-semibold ${meta.text}`}>
                {meta.label}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Diajukan pada{" "}
                {new Date(application.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {application.adminNote && (
                <p className="mt-3 border-t border-current/20 pt-3 text-sm text-zinc-700">
                  <span className="font-medium">Catatan Admin: </span>
                  {application.adminNote}
                </p>
              )}
            </motion.section>

            {/* Info cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard icon={Store} title="Informasi Toko">
                <p className="font-medium text-zinc-900">
                  {application.storeName}
                </p>
                <p className="text-zinc-600">{application.storeType}</p>
              </InfoCard>

              <InfoCard icon={Phone} title="Kontak Pemilik">
                <p className="font-medium text-zinc-900">
                  {application.firstName} {application.lastName}
                </p>
                <p className="text-zinc-600">{application.email}</p>
                <p className="text-zinc-600">{application.phone}</p>
              </InfoCard>
            </div>

            <InfoCard icon={MapPin} title="Alamat Toko">
              <p className="text-zinc-700">
                {application.address || "-"}
                {application.district && `, ${application.district}`}
              </p>
              <p className="text-zinc-700">
                {application.city}, {application.province}{" "}
                {application.postalCode}
              </p>
            </InfoCard>

            {application.documentUrl && (
              <InfoCard icon={FileText} title="Dokumen Pendukung">
                <Link
                  href={application.documentUrl}
                  className="text-sm text-zinc-700 underline hover:text-zinc-900"
                >
                  Lihat dokumen
                </Link>
              </InfoCard>
            )}

            {application.status === "approved" && (
              <Link
                href="/mitra"
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-zinc-900 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 sm:w-auto sm:px-8"
              >
                Masuk ke Mitra Mode →
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-zinc-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-zinc-500" strokeWidth={2} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
          {title}
        </h3>
      </div>
      <div className="space-y-0.5 text-sm">{children}</div>
    </section>
  );
}
