import { NextResponse } from "next/server";

import { listOrders, isConfigured } from "@/lib/qikink";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = (searchParams.get("reference") ?? "").trim();

  if (!reference) {
    return NextResponse.json(
      { error: "Enter your order number." },
      { status: 400 },
    );
  }

  if (!/^[A-Za-z0-9_]{3,22}$/.test(reference)) {
    return NextResponse.json(
      { error: "That order number does not look right." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  type LocalOrder = {
    order_number: string;
    status: string;
    payment_gateway: string;
    total_order_value: number;
    created_at: string;
    qikink_status: string | null;
    tracking_link: string | null;
    awb: string | null;
  };

  let local: LocalOrder | null = null;

  if (supabase) {
    const { data } = await supabase
      .from("orders")
      .select(
        "order_number,status,payment_gateway,total_order_value,created_at,qikink_status,tracking_link,awb",
      )
      .eq("order_number", reference)
      .maybeSingle();
    local = (data as LocalOrder | null) ?? null;
  }

  let live: { status: string; tracking?: string; awb?: string | null } | null =
    null;

  if (isConfigured()) {
    const result = await listOrders({ orderReferenceNo: reference });
    const match = result.orders.find(
      (o) =>
        o.number === reference ||
        o.number.endsWith(reference) ||
        o.number === `${process.env.QIKINK_CLIENT_ID}_${reference}`,
    );
    if (match) {
      live = {
        status: match.status,
        tracking: match.shipping?.tracking_link ?? undefined,
        awb: match.shipping?.awb ?? null,
      };
    }
  }

  if (!local && !live) {
    return NextResponse.json(
      { error: "We could not find that order." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    order: {
      reference,
      status: live?.status ?? local?.qikink_status ?? local?.status ?? "placed",
      payment: local?.payment_gateway ?? null,
      total: local?.total_order_value ?? null,
      placedAt: local?.created_at ?? null,
      trackingLink: live?.tracking ?? local?.tracking_link ?? null,
      awb: live?.awb ?? local?.awb ?? null,
    },
  });
}
