import { NextResponse } from "next/server"; import { requireAdmin } from "@/lib/admin-session"; import {adminCookieName,adminCookieOptions} from "@/lib/admin-auth";
export const dynamic="force-dynamic";
export async function POST(){const denied=await requireAdmin();if(denied)return denied;const res=NextResponse.json({ok:true});res.cookies.set(adminCookieName,"",{...adminCookieOptions,maxAge:0});return res;}
