"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import DevicePageContent from "@/components/DevicePageContent";
import Cookies from "js-cookie";

export default function DevicePage() {
  const router = useRouter();

  React.useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("token");
      const expiry = Cookies.get("expiry");
      if (!token) {
        router.push("/login");
      } else if (expiry && Date.now() > Number(expiry)) {
        clearAuthCookies();
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const clearAuthCookies = () => {
    Cookies.remove("token");
    Cookies.remove("name");
    Cookies.remove("role");
    Cookies.remove("expiry");
    Cookies.remove("email");
  };

  return (
    <>
      <Topbar />
      <Suspense
        fallback={
          <div className="p-6 space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        }
      >
        <DevicePageContent />
      </Suspense>
    </>
  );
}
