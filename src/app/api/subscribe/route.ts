import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: { email?: string; source?: string; line?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address does not look right." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Dev fallback — the site still works without a database attached.
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ message: "You're on the list." });
    }
    return NextResponse.json(
      { error: "Newsletter is temporarily unavailable." },
      { status: 503 },
    );
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      { email, source: body.source ?? "website", line: body.line ?? null },
      { onConflict: "email", ignoreDuplicates: false },
    );

  if (error) {
    // A duplicate is not a failure worth surfacing.
    if (error.code === "23505") {
      return NextResponse.json({ message: "You're already on the list." });
    }
    return NextResponse.json(
      { error: "Could not save your email. Try again shortly." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "You're on the list." });
}
