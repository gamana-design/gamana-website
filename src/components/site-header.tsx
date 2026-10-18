"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Marquee } from "@/components/marquee";
import { useCart } from "@/lib/cart";
import { brand, nav } from "@/lib/brand";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Wordmark({ className, tone = "dark", logoUrl, brandName }: { className?: string; tone?: "dark" | "light"; logoUrl?: string; brandName?: string }) {
  if (logoUrl) return <span className={cn("inline-flex items-center", className)}><img src={logoUrl} alt={brandName ?? brand.name} className="max-h-10 max-w-40 object-contain"/></span>;
  return <span className={cn("inline-flex flex-col leading-none", className)}><span className={cn("font-display text-[1.35rem] font-bold tracking-[-0.055em] md:text-[1.6rem]",tone === "light" ? "text-bone" : "text-kalam")}>{brandName || brand.name}</span><span className={cn("font-telugu text-[0.5rem] font-medium tracking-[0.35em] md:text-[0.55rem]",tone === "light" ? "text-bone/45" : "text-muted")}>{brand.nameTelugu}</span></span>;
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [announcementItems, setAnnouncementItems] = useState(["Free shipping across India over ₹1,499", "Two lines. One mindset.", "Printed on demand — dispatched in 3 days", "From gym to street, without changing who you are"]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({});
  const navItems = Array.isArray(siteSettings.navItems) ? siteSettings.navItems : nav;
  const { count, open } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/site-settings").then(r => r.ok ? r.json() : null).then(data => { if (!data) return; setSiteSettings(data); if (Array.isArray(data.announcementItems) && data.announcementItems.length) setAnnouncementItems(data.announcementItems); }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const overHero = pathname === "/" && !scrolled;

  return (
    <>
      {/* Announcement bar */}
      <div className="relative z-50 bg-kalam text-bone">
        <Marquee
          slow
          className="py-2.5"
          items={announcementItems}
        />
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          overHero
            ? "bg-kalam text-bone"
            : "border-b border-line bg-bone/85 text-graphite backdrop-blur-xl",
        )}
      >
        <div className="container-gamana flex h-[68px] items-center justify-between gap-6 md:h-[76px]">
          <Link href="/" aria-label="GAMANA home" className="shrink-0">
            <Wordmark tone={overHero ? "light" : "dark"} logoUrl={siteSettings.logoUrl} brandName={siteSettings.brandName} />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item: {label:string;href:string}) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href.split("?")[0]);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "link-underline label py-1 transition-opacity",
                    overHero ? "text-bone/80 hover:text-bone" : "text-graphite/75 hover:text-graphite",
                    active && (overHero ? "text-bone" : "text-graphite"),
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href="/shop"
              aria-label="Search the shop"
              className={cn(
                "hidden rounded-full p-2.5 transition-colors sm:block",
                overHero
                  ? "text-bone/80 hover:bg-white/10 hover:text-bone"
                  : "text-graphite/70 hover:bg-kalam/5 hover:text-graphite",
              )}
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </Link>
            <Link
              href="/track"
              className={cn(
                "label hidden px-3 py-2 transition-colors xl:block",
                overHero
                  ? "text-bone/80 hover:text-bone"
                  : "text-graphite/70 hover:text-graphite",
              )}
            >
              Track order
            </Link>
            <button
              type="button"
              onClick={open}
              aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
              className={cn(
                "group relative flex items-center gap-2 rounded-full border px-3.5 py-2 transition-colors md:px-4",
                overHero
                  ? "border-bone/25 text-bone hover:border-bone/60"
                  : "border-line-dark/15 text-graphite hover:border-graphite/40",
              )}
            >
              <ShoppingBag className="h-[17px] w-[17px]" strokeWidth={1.6} />
              <span className="label hidden sm:inline">Bag</span>
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className={cn(
                "rounded-full p-2.5 lg:hidden",
                overHero ? "text-bone" : "text-graphite",
              )}
            >
              <Menu className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[100] bg-kalam text-bone lg:hidden"
          >
            <div className="container-gamana flex h-[68px] items-center justify-between">
              <Wordmark tone="light" logoUrl={siteSettings.logoUrl} brandName={siteSettings.brandName} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-full border border-bone/25 p-2.5"
              >
                <X className="h-5 w-5" strokeWidth={1.6} />
              </button>
            </div>
            <nav className="container-gamana mt-6 flex flex-col">
              {[...navItems, { label: "Track order", href: "/track" }].map(
                (item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.05 + i * 0.05,
                      duration: 0.6,
                      ease: EASE,
                    }}
                    className="border-b border-bone/10"
                  >
                    <Link
                      href={item.href}
                      className="block py-5 font-display text-[2rem] font-semibold tracking-[-0.04em] text-bone"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ),
              )}
            </nav>
            <div className="container-gamana mt-10">
              <p className="label text-bone/40">Follow</p>
              <a
                href={siteSettings.instagram || brand.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline mt-3 inline-block text-bone/80"
              >
                {brand.instagramHandle}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
