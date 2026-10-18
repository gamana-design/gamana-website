"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Refresh server-rendered campaign content at a boundary, including sleeping tabs. */
export function DropClock({ nextChange }: { nextChange: number | null }) {
  const router = useRouter();
  useEffect(() => {
    if (nextChange === null) return;
    let timer: ReturnType<typeof setTimeout>;
    let refreshed = false;
    function check() {
      clearTimeout(timer);
      if (refreshed) return;
      const remaining = nextChange! - Date.now();
      if (remaining <= 0) {
        refreshed = true;
        router.refresh();
      } else timer = setTimeout(check, Math.min(remaining + 100, 60_000));
    }
    check();
    const visible = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("focus", check);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("focus", check);
    };
  }, [nextChange, router]);
  return null;
}
