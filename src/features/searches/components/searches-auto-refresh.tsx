"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchesAutoRefreshProps {
  hasRunningSearches: boolean;
}

export function SearchesAutoRefresh({
  hasRunningSearches,
}: SearchesAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!hasRunningSearches) {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasRunningSearches, router]);

  return null;
}
