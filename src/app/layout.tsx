import type { Metadata, Viewport } from "next";

import { CartDrawer } from "@/components/cart-drawer";
import { SiteChrome } from "@/components/site-chrome";
import { CartProvider } from "@/lib/cart";
import { brand, boilerplate } from "@/lib/brand";
import { absoluteUrl } from "@/lib/utils";

import { BrandText } from "@/components/brand-name";
import { isDesignPreview } from "@/lib/design-preview";
import { getDropSchedule } from "@/lib/drops";

import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  keywords: [
    brand.name,
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
  const { active, nextChange } = getDropSchedule();
  const campaign = active ? { id: active.id, name: active.name } : null;
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
        {isDesignPreview() && <div className="design-preview-notice">Design preview · Sample catalogue · Payments unavailable</div>}
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <SiteChrome campaign={campaign} nextChange={nextChange}>{children}</SiteChrome>
          </div>
          <CartDrawer />
        </CartProvider>
        <p className="sr-only"><BrandText>{boilerplate}</BrandText></p>
      </body>
    </html>
  );
}
