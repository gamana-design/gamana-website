/** Explicitly opt-in, local-only sample content. Never used in production. */
export function isDesignPreview(env: Record<string, string | undefined> = process.env) {
  return env.NODE_ENV === "development" && env.GAMANA_DESIGN_PREVIEW === "1" && !env.SUPABASE_SERVICE_ROLE_KEY;
}
