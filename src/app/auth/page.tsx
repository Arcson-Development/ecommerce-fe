"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Mail, Phone, Lock, User as UserIcon, Loader } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");

  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // backend login accepts username, email or phone as loginKey
        await login({ loginKey: username, password });
      } else {
        await register({ username, password, email, phone, nickname });
      }
      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <TopBar />
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Card container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 shadow-xl rounded-sm overflow-hidden"
          >
            {/* Header tabs */}
            <div className="flex border-b border-zinc-200">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={`flex-1 py-4 text-center text-sm font-semibold tracking-wide uppercase transition-colors relative ${
                  isLogin ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Masuk
                {isLogin && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"
                  />
                )}
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className={`flex-1 py-4 text-center text-sm font-semibold tracking-wide uppercase transition-colors relative ${
                  !isLogin ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Daftar
                {!isLogin && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"
                  />
                )}
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* Logo / Brand */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-zinc-900">
                  {isLogin ? "Selamat Datang Kembali" : "Gabung Pasar Jaya"}
                </h2>
                <p className="mt-1.5 text-xs text-zinc-500">
                  {isLogin
                    ? "Masuk untuk melanjutkan transaksi belanja Anda"
                    : "Mulai belanja sayur & buah segar dari petani langsung"}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-6 p-4 bg-rose-50 border-l-2 border-rose-500 text-rose-700 text-xs font-medium"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username / Login Key */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    {isLogin ? "Username, Email, atau HP" : "Username"}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isLogin ? "Masukkan username/email/hp" : "pilih username unik"}
                      className="w-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm rounded-sm focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors text-zinc-900"
                    />
                  </div>
                </div>

                {/* Additional Register Fields */}
                <AnimatePresence initial={false}>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Nickname */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Nama Panggilan / Nickname
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="text"
                            required
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="nama Anda yang tampil di app"
                            className="w-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm rounded-sm focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors text-zinc-900"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Alamat Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contoh@domain.com"
                            className="w-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm rounded-sm focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors text-zinc-900"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Nomor Telepon / HP
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="contoh: 0812345678"
                            className="w-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm rounded-sm focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors text-zinc-900"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm rounded-sm focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors text-zinc-900"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  className="w-full bg-zinc-900 py-3.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors rounded-sm flex items-center justify-center gap-2 mt-6"
                >
                  {loading && <Loader className="h-4 w-4 animate-spin" />}
                  {isLogin ? "Masuk ke Akun" : "Daftar Sekarang"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
