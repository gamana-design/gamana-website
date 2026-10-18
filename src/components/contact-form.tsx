"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [feedback, setFeedback] = useState("");

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (state === "error") setState("idle");
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setFeedback("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
      setFeedback(data.message || "Message received.");
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch (err) {
      setState("error");
      setFeedback(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-[3px] border border-line bg-bone p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/12">
          <Check className="h-5 w-5 text-success" strokeWidth={2.2} />
        </span>
        <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.03em]">
          Message received
        </h3>
        <p className="mx-auto mt-2.5 max-w-sm text-[0.92rem] leading-relaxed text-muted">
          {feedback} We usually reply within two working days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[3px] border border-line bg-bone p-7 md:p-10"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={update("name")}
            required
            autoComplete="name"
            className="input-base"
            placeholder="Your name"
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={update("email")}
            required
            autoComplete="email"
            className="input-base"
            placeholder="you@email.com"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Subject" htmlFor="subject" optional>
          <input
            id="subject"
            name="subject"
            value={form.subject}
            onChange={update("subject")}
            className="input-base"
            placeholder="Order, sizing, collaboration…"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Message" htmlFor="message">
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={update("message")}
            required
            rows={6}
            className="input-base resize-y"
            placeholder="Tell us what you need."
          />
        </Field>
      </div>

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={update("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      {state === "error" && (
        <p className="mt-5 text-[0.85rem] text-error">{feedback}</p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-kalam px-8 py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-bone transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
            Sending
          </>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
  optional,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="label text-muted">
        {label}
        {optional && <span className="ml-1 normal-case text-muted/60">— optional</span>}
      </span>
      <span className="mt-2.5 block">{children}</span>
    </label>
  );
}
