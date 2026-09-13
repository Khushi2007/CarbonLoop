/**
 * Plain module (no "use client"/server directive) shared by the root layout
 * (Server Component — the no-flash inline script) and the theme toggle
 * (Client Component). A constant like this must live outside either
 * boundary file: importing a plain value export from a "use client" module
 * into a Server Component does not carry its real value across the RSC
 * boundary — only component references are proxied, so the constant
 * resolves to `undefined` on the server. A boundary-free module has no such
 * restriction.
 */
export const THEME_STORAGE_KEY = "carbonloop-theme";
