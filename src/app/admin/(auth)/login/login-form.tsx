"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "Unable to sign in. Please try again.");
        setBusy(false);
        return;
      }
      const next = params.get("next");
      router.replace(
        next?.startsWith("/admin") && !next.startsWith("//") ? next : "/admin",
      );
      router.refresh();
    } catch {
      setError("Unable to sign in. Check your internet and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      {params.get("passwordChanged") === "1" && (
        <p role="status" className="rounded border border-bone/15 p-3 text-sm">
          Password changed. Sign in with your new password.
        </p>
      )}
      <label className="block text-sm text-bone/80">
        Password
        <input
          autoFocus
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-[4px] border border-bone/15 bg-kalam px-4 py-3 text-bone outline-none focus:border-ember"
          required
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="w-full rounded-full bg-ember px-5 py-3 text-sm font-semibold text-kalam disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
