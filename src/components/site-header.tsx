"use client";

import { Menu, ShoppingBag, X, ArrowUpRight, Truck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { SHIPPING_HEADLINE } from "@/lib/shipping";
import { BrandName } from "@/components/brand-name";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Wordmark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return <span className={cn("gamana-wordmark", tone === "light" && "wordmark-light", className)}><BrandName onDark={tone === "light"} /></span>;
}

export function SiteHeader({ campaign }: { campaign: { id: string; name: string } | null }) {
  const pathname = usePathname();
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key !== "Tab") return;
      const nodes = panel.current?.querySelectorAll<HTMLElement>("a[href], button");
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = old; window.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [menuOpen]);
  function bag() { setMenuOpen(false); open(); }
  const links = [{ label: "Shop all", href: "/shop" }, ...(campaign ? [{ label: campaign.name, href: `/shop?drop=${campaign.id}` }] : []), { label: "Our story", href: "/about" }, { label: "Lookbook", href: "/lookbook" }, { label: "Journal", href: "/journal" }, { label: "Contact", href: "/contact" }, { label: "Track order", href: "/track" }];
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="site-announcement"><span>Rooted in origin. Made to move.</span><span className="announcement-shipping"><Truck size={14} aria-hidden="true" />{SHIPPING_HEADLINE}</span></div>
    <header className="brand-header">
      <div className="container-gamana header-grid">
        <nav className="header-left" aria-label="Main navigation"><Link href="/shop" className={pathname === "/shop" ? "nav-active" : ""}>Shop <span className="nav-plus">+</span></Link><Link href="/about" className={pathname === "/about" ? "nav-active" : ""}>Our story</Link></nav>
        <button ref={trigger} type="button" className="mobile-menu-trigger" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}><Menu size={22} strokeWidth={1.4} /></button>
        <Link href="/" aria-label={`${brand.name} home`} className="header-logo"><Wordmark /></Link>
        <div className="header-right"><Link href="/lookbook" className="header-lookbook">Lookbook <ArrowUpRight size={13} /></Link><button type="button" className="header-bag" onClick={bag} aria-label={`Open bag, ${count} items`}><ShoppingBag size={18} strokeWidth={1.4} /><span className="bag-label">Bag</span><span className="bag-count">{count.toString().padStart(2, "0")}</span></button></div>
      </div>
    </header>
    {menuOpen && <div id="mobile-navigation" ref={panel} className="brand-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation"><div className="mobile-menu-top"><Wordmark tone="light" /><button aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={24} /></button></div><nav aria-label="Mobile navigation">{links.map((link, i) => <Link key={link.href} onClick={() => setMenuOpen(false)} href={link.href}><span className="label">0{i+1}</span>{link.label}<ArrowUpRight size={22} /></Link>)}</nav><a href={brand.instagram} target="_blank" rel="noopener noreferrer" className="label">@gamana.wear ↗</a></div>}
  </>;
}
