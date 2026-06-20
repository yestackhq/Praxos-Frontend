import { createClient } from "@supabase/supabase-js";

/**
 * Original-PDF storage, cogsi-style: the browser uploads straight to a Supabase
 * Storage bucket using the public (publishable) key — no service/secret key on
 * the server. Indexing still happens on the backend; this only persists the
 * source file. Best-effort: if storage isn't configured or the upload fails, the
 * caller proceeds with indexing anyway.
 *
 * Requires a `documents` bucket with an anon INSERT policy (we authenticate with
 * Clerk, so there's no Supabase Auth session — uploads run as the anon role).
 */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) || "documents";

export const docStorageEnabled = Boolean(URL && KEY);

const client = docStorageEnabled ? createClient(URL!, KEY!) : null;

export interface StoredFile {
  path: string;
  publicUrl: string;
}

/** Upload a PDF and return its storage path + public URL, or null on any failure. */
export async function uploadOriginalPdf(file: File): Promise<StoredFile | null> {
  if (!client) return null;
  try {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "pdf";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await client.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || "application/pdf",
      upsert: false,
    });
    if (error) return null;
    const { data } = client.storage.from(BUCKET).getPublicUrl(path);
    return { path: `${BUCKET}/${path}`, publicUrl: data.publicUrl };
  } catch {
    return null;
  }
}
