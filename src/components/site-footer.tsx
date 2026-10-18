import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandName, BrandText } from "@/components/brand-name";
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
    <div className="footer-bottom"><p>© {new Date().getFullYear()} <BrandName onDark /></p><p>Rooted in Hyderabad. Made to move.</p><Link href="/contact">Let’s talk <ArrowUpRight size={13} /></Link></div>
  </div></footer>;
}
