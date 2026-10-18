"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function NewsletterForm({
  tone = "dark",
  className,
  source = "footer",
}: {
  tone?: "dark" | "light";
  className?: string;
  source?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const isLight = tone === "light";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
      setMessage(data.message || "You're on the list.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    }
  }

  if (state === "done") {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 text-sm",
          isLight ? "text-bone" : "text-graphite",
          className,
        )}
        role="status"
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            isLight ? "bg-bone/15" : "bg-ember/12",
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)} noValidate>
      <div
        className={cn(
          "group flex items-center gap-2 border-b pb-2 transition-colors",
          isLight
            ? "border-bone/25 focus-within:border-bone/70"
            : "border-graphite/20 focus-within:border-graphite/60",
        )}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          required
          placeholder="your@email.com"
          aria-label="Email address"
          className={cn(
            "w-full bg-transparent text-[0.95rem] outline-none placeholder:text-current/35",
            isLight ? "text-bone" : "text-graphite",
          )}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          aria-label="Subscribe"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
            isLight
              ? "bg-bone text-kalam hover:scale-105"
              : "bg-kalam text-bone hover:scale-105",
            state === "loading" && "opacity-60",
          )}
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          )}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2.5 text-[0.78rem] text-error">{message}</p>
      )}
    </form>
  );
}
