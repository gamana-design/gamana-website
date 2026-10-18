import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    website?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — a real visitor never fills this in.
  if (body.website) {
    return NextResponse.json({ message: "Thanks — we got it." });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address does not look right." },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please write a little more so we can help." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ message: "Message received." });
    }
    return NextResponse.json(
      { error: "Messaging is temporarily unavailable." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    subject: (body.subject ?? "").trim() || null,
    message,
  });

  if (error) {
    return NextResponse.json(
      { error: "Could not send your message. Try again shortly." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Message received. We will reply shortly." });
}
