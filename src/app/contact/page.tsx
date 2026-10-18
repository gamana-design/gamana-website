import type {Metadata} from "next";import {ContactForm} from "@/components/contact-form";import {PageRenderer} from "@/components/site-content/page-renderer";import {getSitePage} from "@/lib/site-content";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const p=await getSitePage("contact");return {title:p?.title??"Contact",description:p?.description,alternates:{canonical:"/contact"}}}
export default async function ContactPage(){const p=await getSitePage("contact");return <>{p&&<PageRenderer page={p}/>}<section className="bg-bone py-14 md:py-20"><div className="container-gamana mx-auto max-w-3xl"><ContactForm/></div></section></>}
