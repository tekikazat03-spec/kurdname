"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_UID = "BVBczt2Ry3bhOnaoNKHK39pRLjg1";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  const isLoginPage = pathname === "/admin/giris";

  useEffect(() => {
    if (isLoginPage) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.uid === ADMIN_UID) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
        router.replace("/admin/giris");
      }
    });

    return () => unsubscribe();
  }, [router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b100e] text-[#d6b875]">
        Yetki kontrol ediliyor...
      </main>
    );
  }

  return <>{children}</>;
}
