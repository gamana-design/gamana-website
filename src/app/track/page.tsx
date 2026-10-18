import type {Metadata} from "next";import {TrackForm} from "@/components/track-form";import {PageRenderer} from "@/components/site-content/page-renderer";import {getSitePage} from "@/lib/site-content";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const p=await getSitePage("track");return {title:p?.title??"Track order",description:p?.description,alternates:{canonical:"/track"}}}
export default async function TrackPage(){const p=await getSitePage("track");return <>{p&&<PageRenderer page={p}/>}<section className="bg-bone py-14 md:py-20"><div className="container-gamana max-w-3xl"><TrackForm/></div></section></>}
