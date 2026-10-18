import { HomepageEditor } from "@/components/admin/homepage-editor";
import { getHomepageSettings } from "@/lib/homepage-store";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };
export default async function HomepageAdmin() { return <><h1 className="font-display text-4xl font-bold">Homepage</h1><p className="mb-6 mt-2 text-sm text-bone/55">Shape the storefront around the current drop.</p><HomepageEditor initial={await getHomepageSettings()} /></>; }
