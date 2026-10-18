import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/admin-session";
import {getSupabaseAdmin} from "@/lib/supabase";
import {getSitePages} from "@/lib/site-content";
export const dynamic="force-dynamic";
export async function GET(){const denied=await requireAdmin();if(denied)return denied;const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:"Supabase is not configured."},{status:503});const {data,error}=await db.from("gamana_site_pages").select("*").order("slug");return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json(data??[]);}
export async function POST(req:Request){const denied=await requireAdmin();if(denied)return denied;try{const page=await req.json();const saved=await (await import("@/lib/site-content")).saveSitePage(page);return NextResponse.json(saved,{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not save page."},{status:400});}}
