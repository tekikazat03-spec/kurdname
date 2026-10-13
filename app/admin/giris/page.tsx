"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_UID = "BVBczt2Ry3bhOnaoNKHK39pRLjg1";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (result.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setError("Bu hesabın yönetim yetkisi bulunmuyor.");
        return;
      }

      router.replace("/admin");
    } catch (error) {
      console.error("Firebase giriş hatası:", error);
      setError(error instanceof Error ? error.message : "Bilinmeyen giriş hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b100e] px-6 py-16 text-[#e8e0cb]">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <a
            href="/"
            className="text-2xl font-semibold tracking-[0.3em] text-[#d6b875]"
          >
            KURDNAME
          </a>

          <div className="mx-auto my-8 h-px w-20 bg-[#b99a5b]" />

          <h1 className="font-serif text-4xl text-[#f1e6cc]">
            Yönetici Girişi
          </h1>

          <p className="mt-4 text-sm text-[#a89f8b]">
            Dijital arşiv yönetim paneli
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6 border border-[#b99a5b]/25 bg-[#111a15] p-8"
        >
          <div>
            <label
              htmlFor="admin-email"
              className="mb-3 block text-xs uppercase tracking-[0.2em] text-[#c2a46a]"
            >
              E-posta
            </label>

            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresin"
              className="h-13 w-full border border-[#b99a5b]/25 bg-[#0b100e] px-4 py-3 text-white outline-none focus:border-[#d6b875]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-3 block text-xs uppercase tracking-[0.2em] text-[#c2a46a]"
            >
              Şifre
            </label>

            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifren"
              className="h-13 w-full border border-[#b99a5b]/25 bg-[#0b100e] px-4 py-3 text-white outline-none focus:border-[#d6b875]"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c2a46a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#0b100e] transition hover:bg-[#e3c88e] disabled:opacity-50"
          >
            {loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#8c8575]">
          KURDNAME · Kürdistan'ın Dijital Arşivi
        </p>
      </div>
    </main>
  );
}

