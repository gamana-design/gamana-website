"use client";

import { useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  MEDIA_STORAGE_BUCKET,
  mediaStorageErrorMessage,
  mediaUploadValidationError,
  parseMediaUploadResponse,
} from "@/lib/upload-response";

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
    setError("");
    const validationError = mediaUploadValidationError({
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      folder,
    });
    if (validationError) {
      setError(validationError);
      if (ref.current) ref.current.value = "";
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          folder,
          label,
        }),
      });
      const ticket = await parseMediaUploadResponse(res);
      const { error: storageError } = await getSupabaseBrowser()
        .storage.from(MEDIA_STORAGE_BUCKET)
        .uploadToSignedUrl(ticket.path, ticket.token, file, {
          contentType: file.type,
        });
      if (storageError) {
        throw new Error(mediaStorageErrorMessage(storageError.message));
      }
      onChange(ticket.url);
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
          accept={
            folder === "designs"
              ? "image/jpeg,image/png,image/webp,image/avif,image/gif,.pdf"
              : "image/jpeg,image/png,image/webp,image/avif,image/gif"
          }
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
