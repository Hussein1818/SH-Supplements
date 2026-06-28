"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "./authStore";

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkRefresh = useAuthStore((state) => state.checkRefresh);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkRefresh();
  }, [checkRefresh]);

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F9F9]">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">
          Loading...{" "}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
