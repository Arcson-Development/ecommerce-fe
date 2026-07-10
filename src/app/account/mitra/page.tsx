"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";
import { Store, CheckCircle2, ChevronRight, Package } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import {
  AccountSidebar,
  AccountLayoutHeader,
} from "@/components/account/AccountSidebar";
import { useMitra, MITRA_STATUS_META } from "@/lib/mitra";
import { useAuth } from "@/lib/auth";

export default function MitraPage() {
  const applications = useMitra((s) => s.applications);
  const hasApplied = useMitra((s) => s.hasApplied);
  const fetchMitraStatus = useMitra((s) => s.fetchMitraStatus);
  const user = useAuth((s) => s.user);

  // Sync mitra status from backend on mount
  useEffect(() => {
    fetchMitraStatus();
  }, [fetchMitraStatus]);

  const isAlreadyMitra = user?.role === "MITRA" || hasApplied || applications.length > 0;

  return (
    <>
      <TopBar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountLayoutHeader title="Mitra" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="mitra" />

          <div className="space-y-6">
            {isAlreadyMitra ? (
              <UserMitraDashboard />
            ) : (
              <RecruitmentPanel />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function RecruitmentPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-sm border border-zinc-200 bg-white"
    >
      <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 md:grid-cols-[180px_1fr]">
        {/* Avatar / mascot */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex items-center justify-center"
        >
          <div className="relative h-32 w-32 overflow-hidden rounded-full bg-orange-50 sm:h-40 sm:w-40">
            <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl">
              🦊
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex flex-col">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Diya Frans Adhitya #231342
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900 sm:text-xl">
            Oops, sepertinya kamu belum bergabung menjadi mitra kami.
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Cobalah bergabung bersama kami dan nikmati keuntungan yang bisa
            kamu dapatkan.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-zinc-700">
            <Benefit
              text="Jangkauan pembeli yang luas"
              icon={Store}
            />
            <Benefit
              text="Kemudahan pengelolaan storage"
              icon={Package}
            />
            <Benefit
              text="Pemantauan profit dan dashboard khusus"
              icon={CheckCircle2}
            />
          </ul>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/account/mitra/register"
              className="inline-flex items-center justify-center border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
            >
              Daftar Sekarang
            </Link>
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              Lihat Status
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-zinc-200 bg-zinc-50 px-6 py-4">
        <Link
          href="/mitra"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Masuk ke Mitra Mode
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </motion.section>
  );
}

function Benefit({
  text,
  icon: Icon,
}: {
  text: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-zinc-100 text-zinc-700">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span>{text}</span>
    </li>
  );
}

function UserMitraDashboard() {
  const applications = useMitra((s) => s.applications);
  const storeProfile = useMitra((s) => s.storeProfile);
  const user = useAuth((s) => s.user);

  const isMitra = user?.role === "MITRA" || user?.role === "ADMIN";

  return (
    <>
      {/* Store Profile Card */}
      {isMitra && storeProfile && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-sm border border-zinc-200 bg-white"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
              Toko Anda
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Aktif
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-zinc-100">
                <Store className="h-7 w-7 text-zinc-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-900">{storeProfile.name}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{storeProfile.address || "Alamat belum diisi"}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
            <Link
              href="/mitra"
              className="inline-flex items-center gap-1.5 rounded-sm bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800"
            >
              Masuk ke Mitra Mode
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.section>
      )}

      {/* Application History */}
      {applications.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-sm border border-zinc-200 bg-white"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
              Riwayat Pengajuan
            </h3>
            <p className="text-xs text-zinc-500">
              {applications.length} pengajuan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3">ID Pengajuan</th>
                  <th className="px-5 py-3">Nama Toko</th>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {applications.map((app) => {
                  const meta = MITRA_STATUS_META[app.status];
                  return (
                    <tr
                      key={app.id}
                      className="text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-5 py-4 font-mono font-semibold text-zinc-900">
                        #{app.id}
                      </td>
                      <td className="px-5 py-4">{app.storeName}</td>
                      <td className="px-5 py-4 text-zinc-600">
                        {new Date(app.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.bg} ${meta.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/account/mitra/${app.id}`}
                          className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                        >
                          Lihat Pengajuan
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

    </>
  );
}
