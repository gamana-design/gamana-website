import {NextResponse} from "next/server";import {getSiteSettings} from "@/lib/site-content";import {getHomepageSettings} from "@/lib/homepage-store";
export const dynamic="force-dynamic";
export async function GET(){const [site,home]=await Promise.all([getSiteSettings(),getHomepageSettings()]);return NextResponse.json({...site,announcementItems:home.announcementItems,coreComingSoon:home.coreComingSoon,coreComingSoonText:home.coreComingSoonText},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=120"}})}
