"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router, isHydrated]);

  // Always show loading on server and until hydrated to prevent mismatch
  if (!isHydrated || isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">Indlæser...</div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}