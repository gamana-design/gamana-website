import "server-only";
import { products } from "@/data/legacy-catalog";
import { saveProduct } from "@/lib/catalog-store";
import { getSupabaseAdmin } from "@/lib/supabase";
export async function seedCatalogue() {
 const db=getSupabaseAdmin();if(!db)throw new Error("Supabase is not configured.");
 let created=0;
 for(const p of products){const {data,error}=await db.from("gamana_products").select("id").eq("slug",p.slug).maybeSingle();if(error)throw error;if(data?.id)continue;await saveProduct({...p,active:true});created++;}
 return created;
}
