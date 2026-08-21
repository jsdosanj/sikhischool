import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "../../drizzle/schema";

// D1 bindings only exist at request time inside the Workers runtime, so the
// db client is constructed per-request rather than at module load.
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
}
