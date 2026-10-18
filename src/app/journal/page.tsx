import type {Metadata} from "next";import {PageRenderer} from "@/components/site-content/page-renderer";import {getSitePage} from "@/lib/site-content";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const page=await getSitePage("journal");return {title:page?.title??"Journal",description:page?.description,alternates:{canonical:"/journal"}}}
export default async function JournalPage(){const page=await getSitePage("journal");return page?<PageRenderer page={page}/>:<main className="min-h-[50vh] bg-kalam px-6 py-24 text-center text-bone"><h1 className="font-display text-3xl">This page is being set up</h1></main>}
