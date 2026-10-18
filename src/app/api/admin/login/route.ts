import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, checkAdminPassword, createSessionToken, isAdminConfigured } from "@/lib/admin-auth";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest){if(!isAdminConfigured())return NextResponse.json({error:"Admin access is not configured."},{status:503});const {password}=await req.json().catch(()=>({}));if(typeof password!=="string"||!(await checkAdminPassword(password))){await new Promise(r=>setTimeout(r,500));return NextResponse.json({error:"Wrong password."},{status:401});}const res=NextResponse.json({ok:true});res.cookies.set(adminCookieName,await createSessionToken(),adminCookieOptions);return res;}
