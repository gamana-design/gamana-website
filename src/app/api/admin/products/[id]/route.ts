import {NextResponse} from "next/server";import {revalidateTag} from "next/cache";import {requireAdmin} from "@/lib/admin-session";import {deleteProduct,saveProduct} from "@/lib/catalog-store";
export const dynamic="force-dynamic";
type C={params:Promise<{id:string}>};
export async function PATCH(req:Request,{params}:C){const denied=await requireAdmin();if(denied)return denied;try{const {id}=await params;const draft=await req.json();const saved=await saveProduct({...draft,id});revalidateTag("gamana-products");return NextResponse.json({id:saved});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not save."},{status:400});}}
export async function DELETE(_:Request,{params}:C){const denied=await requireAdmin();if(denied)return denied;try{await deleteProduct((await params).id);revalidateTag("gamana-products");return NextResponse.json({ok:true});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not delete."},{status:400});}}
