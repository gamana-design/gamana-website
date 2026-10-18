"use client";
import {usePathname} from "next/navigation";import {SiteHeader} from "@/components/site-header";import {SiteFooter} from "@/components/site-footer";
export function SiteChrome({children}:{children:React.ReactNode}){const path=usePathname();if(path.startsWith("/admin"))return <>{children}</>;return <><SiteHeader/><main className="flex-1">{children}</main><SiteFooter/></>;}
