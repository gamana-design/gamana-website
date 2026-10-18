import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { getAllProducts, saveProduct } from "@/lib/catalog-store";
export const dynamic = "force-dynamic";
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ products: await getAllProducts() });
}
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const d = await req.json();
    if (!d.slug || !d.name || !d.image)
      return NextResponse.json(
        { error: "Slug, name and image are required." },
        { status: 400 },
      );
    const id = await saveProduct(d);
    revalidateTag("gamana-products");
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not save product." },
      { status: 400 },
    );
  }
}
