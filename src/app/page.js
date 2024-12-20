"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import Cookies from "js-cookie";
import DeviceEventsPage from "@/components/Events/DeviceEventsPage";
import Footer from "@/components/Footer";

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
            <Skeleton className="h-[75vh] w-full" />
          </div>
        }
      >
        <DeviceEventsPage />
      </Suspense>

      <Footer/>
    </>

  );
}
