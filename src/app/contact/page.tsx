import type { Metadata } from "next";
import { Instagram, Mail, MapPin, Package } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about sizing, an existing order, or a collaboration? Talk to the GAMANA team in Hyderabad.",
  alternates: { canonical: "/contact" },
};

const channels = [
  {
    icon: Instagram,
    label: "Instagram",
    value: brand.instagramHandle,
    href: brand.instagram,
    note: "Drops, restocks and studio notes.",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@gamana.wear",
    href: "mailto:hello@gamana.wear",
    note: "We reply within two working days.",
  },
  {
    icon: MapPin,
    label: "Studio",
    value: brand.base,
    note: "Visits by appointment.",
  },
  {
    icon: Package,
    label: "Existing order",
    value: "Track it online",
    href: "/track",
    note: "Live status straight from fulfilment.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-line bg-bone-deep/40">
        <div className="container-gamana py-14 md:py-20">
          <p className="label text-muted">Contact</p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.4rem,7vw,5.2rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]">
            Say something
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-[0.98rem] leading-relaxed text-muted">
            Sizing, an order that needs chasing, a collaboration, or a piece you
            want us to make next. We read everything.
          </p>
        </div>
      </section>

      <section className="bg-bone py-14 md:py-20">
        <div className="container-gamana grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.08}>
            <p className="label text-muted">Other ways</p>
            <ul className="mt-7 divide-y divide-line border-y border-line">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const content = (
                  <>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-graphite">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="label text-muted">{channel.label}</span>
                      <span className="mt-1.5 block text-[0.98rem] font-medium">
                        {channel.value}
                      </span>
                      <span className="mt-1 block text-[0.85rem] text-muted">
                        {channel.note}
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={channel.label}>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        {...(channel.href.startsWith("http")
                          ? { target: "_blank", rel: "noreferrer noopener" }
                          : {})}
                        className="group flex items-center gap-4 py-5 transition-opacity hover:opacity-70"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 py-5">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 rounded-[3px] bg-kalam p-8 text-bone">
              <p className="label text-bone/40">Response time</p>
              <p className="mt-4 font-display text-[1.35rem] font-semibold leading-snug tracking-[-0.03em]">
                Two working days, usually faster.
              </p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-bone/65">
                We are a small team in {brand.base} building the brand you can
                see. Every message gets read by someone who can actually change
                something.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
