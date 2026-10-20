"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("The two new passwords do not match.");
      return;
    }
    if (newPassword.length < 12) {
      setError("Choose a new password with 12 or more characters.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "The password could not be changed. Try again.");
        setBusy(false);
        return;
      }
      router.replace("/admin/login?passwordChanged=1");
      router.refresh();
    } catch {
      setError("The password could not be changed. Check your internet and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-5">
      <label className="block text-sm text-bone/85">
        Current password
        <input
          type="password"
          autoComplete="current-password"
          required
          maxLength={1024}
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="mt-2 w-full rounded-[4px] border border-bone/15 bg-kalam px-4 py-3 text-bone outline-none focus:border-ember"
        />
      </label>

      <label className="block text-sm text-bone/85">
        New password
        <span className="mt-1 block text-xs text-bone/50">
          Use 12 or more characters. A short sentence is easier to remember.
        </span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="mt-2 w-full rounded-[4px] border border-bone/15 bg-kalam px-4 py-3 text-bone outline-none focus:border-ember"
        />
      </label>

      <label className="block text-sm text-bone/85">
        Type the new password again
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mt-2 w-full rounded-[4px] border border-bone/15 bg-kalam px-4 py-3 text-bone outline-none focus:border-ember"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ember px-5 py-3 text-sm font-semibold text-kalam disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
