import {NextResponse} from "next/server";import {requireAdmin} from "@/lib/admin-session";import {ping,listOrders,createOrder,buildOrderNumber} from "@/lib/qikink";import {logAdminAction} from "@/lib/catalog-store";import {getSupabaseAdmin} from "@/lib/supabase";
export const dynamic="force-dynamic";
export async function GET(req:Request){
 const denied=await requireAdmin();if(denied)return denied;
 const ref=new URL(req.url).searchParams.get("reference");
 if(!ref)return NextResponse.json(await ping());
 const result=await listOrders({orderReferenceNo:ref});
 if(!result.ok||!result.orders.length)return NextResponse.json(result);
 const qikinkOrder=result.orders[0];
 const db=getSupabaseAdmin();
 if(!db)return NextResponse.json(result);
 let query=await db.from("orders").select("*, order_items(*)").eq("qikink_reference",ref).maybeSingle();
 if(!query.data)query=await db.from("orders").select("*, order_items(*)").eq("order_number",ref).maybeSingle();
 const order=query.data;
 if(!order)return NextResponse.json(result);
 const status=String(qikinkOrder.status??"Unknown");
 const normalized=status.toLowerCase();
 const dispatched=/ship|dispatch|in transit|out for delivery|delivered/.test(normalized);
 const tracking=qikinkOrder.shipping?.tracking_link??null;
 const awb=qikinkOrder.shipping?.awb??null;
 const updated=await db.from("orders").update({qikink_status:status,...(dispatched?{status:"shipped"}:{}),...(tracking?{tracking_link:tracking}:{}),...(awb?{awb}: {})}).eq("id",order.id);
 return NextResponse.json({...result,orderUpdated:!updated.error});
}
export async function POST(req:Request){const denied=await requireAdmin();if(denied)return denied;try{const d=await req.json();const now=Date.now().toString(36);const line={search_from_my_products:0 as const,print_type_id:Number(d.printTypeId??1),quantity:String(d.quantity??"1"),sku:String(d.sku),price:String(d.price??"1"),designs:[{design_code:String(d.designCode).slice(0,20),width_inches:Number(d.widthInches??12),height_inches:Number(d.heightInches??15),placement_sku:d.placementSku??"fr",design_link:d.designUrl,mockup_link:d.mockupUrl}]};const result=await createOrder({order_number:`gmtest${now}`.slice(0,15),qikink_shipping:1,gateway:"Prepaid",total_order_value:String(d.price??1),line_items:[line],shipping_address:{first_name:d.firstName??"Gamana",last_name:d.lastName??"Test",address1:d.address1??"Test Address",phone:d.phone??"9999999999",email:d.email??"test@example.com",city:d.city??"Hyderabad",zip:d.zip??"500001",province:d.province??"Telangana",country_code:d.countryCode??"IN"}});await logAdminAction("qikink_test_order",`${result.ok?"accepted":"failed"}: ${result.orderId??result.error??""}`);return NextResponse.json(result,{status:result.ok?200:502});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not create test order."},{status:400});}}
