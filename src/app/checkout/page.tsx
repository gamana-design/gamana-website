import type {Metadata} from "next";import {CheckoutForm} from "@/components/checkout-form";import {PageRenderer} from "@/components/site-content/page-renderer";import {getSitePage} from "@/lib/site-content";
export const dynamic="force-dynamic";export const metadata:Metadata={title:"Checkout",robots:{index:false,follow:false}};
export default async function CheckoutPage(){const p=await getSitePage("checkout");return <><>{p&&<PageRenderer page={p}/>}</><section className="bg-bone py-12 md:py-20"><div className="container-gamana"><CheckoutForm/></div></section></>}
