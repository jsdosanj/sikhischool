// Merges wrangler's generated `Env` (worker-configuration.d.ts, regenerate via
// `npx wrangler types` after changing wrangler.jsonc) into OpenNext's global
// `CloudflareEnv` interface, so `getCloudflareContext().env` is typed.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentional: this is the documented pattern for merging into OpenNext's global CloudflareEnv interface
  interface CloudflareEnv extends Env {}
}

export {};
