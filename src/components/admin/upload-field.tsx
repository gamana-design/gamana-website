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
  onChange: (value: string) => void;
  folder: string;
  label: string;
  preview?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isDesignFile = folder === "designs";
  const fileLabel = isDesignFile ? "design file" : "photo";

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
      const response = await fetch("/api/admin/upload", {
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
      const ticket = await parseMediaUploadResponse(response);
      const { error: storageError } = await getSupabaseBrowser()
        .storage.from(MEDIA_STORAGE_BUCKET)
        .uploadToSignedUrl(ticket.path, ticket.token, file, {
          contentType: file.type,
        });
      if (storageError)
        throw new Error(mediaStorageErrorMessage(storageError.message));
      onChange(ticket.url);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "The upload failed. Please try again.",
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
          aria-label={`Choose ${fileLabel} for ${label}`}
          accept={
            isDesignFile
              ? "image/jpeg,image/png,image/webp,image/avif,image/gif,.pdf"
              : "image/jpeg,image/png,image/webp,image/avif,image/gif"
          }
          hidden
          onChange={(event) => upload(event.target.files?.[0])}
        />
        <button
          type="button"
          disabled={busy}
          aria-label={`${value ? "Change" : "Choose"} ${fileLabel} for ${label}`}
          onClick={() => ref.current?.click()}
          className="rounded-full border border-bone/15 px-4 py-2 text-xs disabled:opacity-50"
        >
          {busy
            ? "Adding…"
            : value
              ? `Change ${fileLabel}`
              : `Choose ${fileLabel}`}
        </button>
        {value && (
          <button
            type="button"
            disabled={busy}
            aria-label={`Remove ${label}`}
            onClick={() => onChange("")}
            className="text-xs text-bone/50"
          >
            Remove
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-ember">
          {error}
        </p>
      )}
      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-bone/50">
          Paste a link instead (optional)
        </summary>
        <input
          aria-label={`${label} URL`}
          disabled={busy}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste a public link"
          className="mt-2 w-full rounded border border-bone/10 bg-kalam px-3 py-2 text-xs"
        />
      </details>
    </div>
  );
}
