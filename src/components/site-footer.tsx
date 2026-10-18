"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Wordmark } from "@/components/site-header";
import { brand, lines, socials } from "@/lib/brand";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "URBAN", href: "/shop?line=URBAN" },
      { label: "CORE", href: "/shop?line=CORE" },
      { label: "T-Shirts", href: "/shop?category=T-Shirts" },
      { label: "Accessories", href: "/shop?category=Accessories" },
    ],
  },
  {
    title: "Brand",
    links: [
      { label: "About", href: "/about" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "Journal", href: "/journal" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track order", href: "/track" },
      { label: "Shipping & returns", href: "/about#shipping" },
      { label: "Size guide", href: "/about#sizing" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  useEffect(() => { fetch("/api/site-settings").then(r => r.ok ? r.json() : null).then(data => { if (data) setSettings(data); }).catch(() => undefined); }, []);
  const footerLinks = Array.isArray(settings.footerLinks) ? settings.footerLinks : (settings.navItems ?? []).map((x: any) => ({ title: "Explore", label: x.label, href: x.href }));
  const footerColumns = footerLinks.length ? [{ title: "Explore", links: footerLinks }] : columns;
  return (
    <footer className="relative overflow-hidden bg-kalam text-bone">
      <div className="container-gamana pt-20 md:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <Wordmark tone="light" logoUrl={settings.logoUrl} brandName={settings.brandName} />
            <p className="mt-4 label text-bone/35">{brand.category}</p>
            <p className="mt-5 max-w-sm text-pretty text-[0.95rem] leading-relaxed text-bone/55">
              {settings.footerBlurb || brand.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {lines.map((line) => (
                <Link
                  key={line.key}
                  href={line.href}
                  className="label rounded-full border border-bone/20 px-4 py-2.5 text-bone/70 transition-colors hover:border-bone/60 hover:text-bone"
                >
                  {line.name}
                </Link>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {[{ label: "Instagram", href: settings.instagram || brand.instagram }, ...socials.filter(s => s.label !== "Instagram")].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  {...(s.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className="link-underline label text-bone/55 hover:text-bone"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {footerColumns.map((col: any) => (
              <div key={col.title}>
                <p className="label text-bone/35">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link: {label:string;href:string}) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="link-underline text-[0.95rem] text-bone/70 hover:text-bone"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Oversized wordmark */}
        <div className="mt-20 select-none md:mt-28">
          <p
            aria-hidden="true"
            className="font-display text-[18vw] font-bold leading-[0.78] tracking-[-0.06em] text-bone/[0.07]"
          >
            {settings.brandName || brand.name}
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-bone/10 py-7 text-[0.8rem] text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p>
            Based in {brand.base} · Shipping to {brand.markets.join(" & ")}
          </p>
        </div>
      </div>
    </footer>
  );
}
