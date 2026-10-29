"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ADMIN_UID } from "@/lib/admin";

// This guards the UI; Firebase rules remain the authority for database writes.
export default function AdminGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const isLogin = pathname === "/admin/giris";

  useEffect(() => onAuthStateChanged(auth, (user) => {
    const isAdmin = user?.uid === ADMIN_UID;
    setAllowed(isAdmin);
    if (!isAdmin && !isLogin) router.replace("/admin/giris");
  }), [isLogin, router]);

  if (isLogin || allowed) return children;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b100e] text-[#e8e0cb]">
      <p role="status">Yönetici oturumu kontrol ediliyor...</p>
    </main>
  );
}
