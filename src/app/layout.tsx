import type { Metadata, Viewport } from "next";

import { CartDrawer } from "@/components/cart-drawer";
import { SiteChrome } from "@/components/site-chrome";
import { CartProvider } from "@/lib/cart";
import { brand, boilerplate } from "@/lib/brand";
import { absoluteUrl } from "@/lib/utils";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  keywords: [
    "GAMANA",
    "streetwear India",
    "performance apparel",
    "cultural streetwear",
    "Godavari Tee",
    "oversized graphic tee",
    "URBAN",
    "CORE",
    "Hyderabad",
  ],
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary",
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    images: [absoluteUrl("/")],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0B0B10",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    alternateName: brand.nameTelugu,
    description: brand.description,
    slogan: brand.tagline,
    foundingDate: brand.founded,
    founder: { "@type": "Person", name: brand.owner },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressCountry: "IN",
    },
    areaServed: brand.markets.map((m) => ({ "@type": "Country", name: m })),
    sameAs: [brand.instagram],
  };

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <SiteChrome>{children}</SiteChrome>
          </div>
          <CartDrawer />
        </CartProvider>
        <p className="sr-only">{boilerplate}</p>
      </body>
    </html>
  );
}
