import React from "react";
import Link from "next/link";
import { ArrowUpRight, LogIn, Truck } from "lucide-react";
import { BrandName, BrandText } from "@/components/brand-name";
import { SHIPPING_HEADLINE } from "@/lib/shipping";
import { brand } from "@/lib/brand";

const columns = [
  { title: "Explore", links: [{ label: "Shop all", href: "/shop" }, { label: "URBAN", href: "/shop?line=URBAN" }, { label: "CORE", href: "/shop?line=CORE" }, { label: "Lookbook", href: "/lookbook" }] },
  { title: brand.name, links: [{ label: "Our story", href: "/about" }, { label: "Journal", href: "/journal" }, { label: "Contact", href: "/contact" }] },
  { title: "Here to help", links: [{ label: "Track your order", href: "/track" }, { label: "Shipping & returns", href: "/contact" }, { label: "Sizing help", href: "/contact" }, { label: "Get in touch", href: "/contact" }] },
];
export function SiteFooter() {
  return <footer className="brand-footer"><div className="container-gamana">
    <div className="footer-top"><div className="footer-manifesto"><p className="label">Culture. Movement. Everyday.</p><h2>What grounds you.<br /><span>Moves you.</span></h2><a className="footer-social" href={brand.instagram} target="_blank" rel="noopener noreferrer">Follow the journey <ArrowUpRight size={17} /></a></div><div className="footer-columns">{columns.map(col => <div key={col.title}><p className="label"><BrandText onDark>{col.title}</BrandText></p><ul>{col.links.map(link => <li key={link.label}><Link href={link.href}>{link.label}</Link></li>)}</ul></div>)}</div></div>
    <div className="footer-wordmark" aria-hidden="true"><BrandName onDark /><span className="footer-registered">®</span></div>
    <p className="footer-shipping"><Truck size={18} aria-hidden="true" /><span>{SHIPPING_HEADLINE} <span>Included in the price.</span></span></p>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} <BrandName onDark /></p><p>Rooted in Hyderabad. Made to move.</p><Link href="/contact">Let’s talk <ArrowUpRight size={13} /></Link></div>
    <div className="flex justify-end pb-6">
      <Link href="/admin/login" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-bone/20 px-4 text-xs text-bone/60 transition-colors hover:border-bone/50 hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bone">
        <LogIn size={15} aria-hidden="true" />
        Admin login
      </Link>
    </div>
  </div></footer>;
}
