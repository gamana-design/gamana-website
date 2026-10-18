"use client";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DropClock } from "@/components/drops/drop-clock";

export function SiteChrome({ children, campaign, nextChange }: { children: React.ReactNode; campaign: { id: string; name: string } | null; nextChange: number | null }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return <>{children}</>;
  return <><DropClock nextChange={nextChange} /><SiteHeader campaign={campaign} /><main id="main-content" className="storefront-main flex-1" tabIndex={-1}>{children}</main><SiteFooter /></>;
}
