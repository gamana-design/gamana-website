"use client";

import { useRef, useState } from "react";

export function UploadField({
  value,
  onChange,
  folder,
  label,
  preview = true,
}: {
  value: string;
  onChange: (v: string) => void;
  folder: string;
  label: string;
  preview?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", folder);
      body.set("label", label);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Upload failed. Please try again.");
      onChange(result.url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }
  return (
    <div aria-busy={busy}>
      <div className="flex flex-wrap items-center gap-3">
        {preview && value && (
          <img
            src={value}
            alt={`${label} preview`}
            className="h-16 w-16 rounded object-cover"
          />
        )}
        <input
          ref={ref}
          type="file"
          aria-label={`Choose ${label}`}
          accept={folder === "designs" ? "image/*,.pdf" : "image/*"}
          hidden
          onChange={(e) => upload(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={busy}
          aria-label={`Upload ${label}`}
          onClick={() => ref.current?.click()}
          className="rounded-full border border-bone/15 px-4 py-2 text-xs disabled:opacity-50"
        >
          {busy ? "Uploading…" : value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            disabled={busy}
            aria-label={`Clear ${label}`}
            onClick={() => onChange("")}
            className="text-xs text-bone/50"
          >
            Clear
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-ember">
          {error}
        </p>
      )}
      <input
        aria-label={`${label} URL`}
        disabled={busy}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste a public image link"
        className="mt-2 w-full rounded border border-bone/10 bg-kalam px-3 py-2 text-xs"
      />
    </div>
  );
}
