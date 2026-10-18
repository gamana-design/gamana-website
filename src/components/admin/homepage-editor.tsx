"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HomepageSettings } from "@/lib/homepage-store";
import { UploadField } from "@/components/admin/upload-field";

const input = "mt-1 w-full rounded-[4px] border border-bone/10 bg-kalam px-3 py-2 text-sm text-bone";
function TextField({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className="block text-xs text-bone/65">{label}{multiline ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} className={input} /> : <input value={value} onChange={e => onChange(e.target.value)} className={input} />}</label>;
}
export function HomepageEditor({ initial }: { initial: HomepageSettings }) {
  const [settings, setSettings] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const update = (key: keyof HomepageSettings, value: string | boolean | string[]) => setSettings(current => ({ ...current, [key]: value }));
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("Saving…");
    const response = await fetch("/api/admin/homepage", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(settings) });
    const body = await response.json();
    if (!response.ok) { setMessage(body.error || "Save failed."); setBusy(false); return; }
    setSettings(body); setMessage("Homepage saved."); setBusy(false); router.refresh();
  }
  return <form onSubmit={save} className="space-y-5">
    <section className="rounded-[4px] border border-bone/10 bg-bone/[0.03] p-5"><h2 className="font-display text-xl">Drop hero</h2><p className="mb-4 mt-1 text-xs text-bone/50">Update the homepage lead-in for each collection/drop.</p><div className="grid gap-4 md:grid-cols-2"><TextField label="Drop label" value={settings.heroEyebrow} onChange={v => update("heroEyebrow",v)} /><TextField label="Headline, first line" value={settings.heroLineOne} onChange={v => update("heroLineOne",v)} /><TextField label="Headline lead" value={settings.heroLead} onChange={v => update("heroLead",v)} /><TextField label="Headline accent" value={settings.heroAccent} onChange={v => update("heroAccent",v)} /><TextField label="Headline tail" value={settings.heroTail} onChange={v => update("heroTail",v)} /><TextField label="Hero description" multiline value={settings.heroDescription} onChange={v => update("heroDescription",v)} /></div><div className="mt-4"><p className="mb-2 text-xs text-bone/65">Hero background image</p><UploadField value={settings.heroImage} onChange={v => update("heroImage",v)} folder="products" label="homepage-hero" /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><TextField label="Primary button" value={settings.primaryCta} onChange={v => update("primaryCta",v)} /><TextField label="Primary destination" value={settings.primaryHref} onChange={v => update("primaryHref",v)} /><TextField label="Secondary button" value={settings.secondaryCta} onChange={v => update("secondaryCta",v)} /><TextField label="Secondary destination" value={settings.secondaryHref} onChange={v => update("secondaryHref",v)} /></div></section>
    <section className="rounded-[4px] border border-bone/10 bg-bone/[0.03] p-5"><h2 className="font-display text-xl">Collection sections</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><TextField label="Collection eyebrow" value={settings.collectionEyebrow} onChange={v => update("collectionEyebrow",v)} /><TextField label="Collection headline" value={settings.collectionTitle} onChange={v => update("collectionTitle",v)} /><TextField label="Collection description" multiline value={settings.collectionDescription} onChange={v => update("collectionDescription",v)} /><TextField label="CORE coming-soon note" multiline value={settings.coreComingSoonText} onChange={v => update("coreComingSoonText",v)} /><TextField label="Featured section eyebrow" value={settings.featuredEyebrow} onChange={v => update("featuredEyebrow",v)} /><TextField label="Featured section headline" value={settings.featuredTitle} onChange={v => update("featuredTitle",v)} /></div><label className="mt-4 inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.coreComingSoon} onChange={e => update("coreComingSoon",e.target.checked)} className="accent-orange-500" />Keep CORE hidden and show Coming Soon on the storefront</label></section>
    <section className="rounded-[4px] border border-bone/10 bg-bone/[0.03] p-5"><h2 className="font-display text-xl">Announcement ticker</h2><p className="mb-3 mt-1 text-xs text-bone/50">One message per line.</p><textarea rows={4} value={settings.announcementItems.join("\n")} onChange={e => update("announcementItems",e.target.value.split("\n").map(x => x.trim()).filter(Boolean))} className={input} /></section>
    <div className="flex items-center gap-4"><button disabled={busy} className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-kalam">{busy ? "Saving…" : "Save homepage"}</button><span className="text-sm text-bone/60">{message}</span></div>
  </form>;
}
