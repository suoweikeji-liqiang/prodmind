import { db } from "./db";
import { config } from "./db/schema";
import { eq } from "drizzle-orm";

export interface AppConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export async function getAppConfig(): Promise<AppConfig> {
  const rows = await db.select().from(config);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    apiKey: map.apiKey || "",
    baseURL: map.baseURL || "",
    model: map.model || "gpt-4o",
  };
}

export async function setAppConfig(updates: Partial<AppConfig>): Promise<void> {
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      await db.insert(config)
        .values({ key, value })
        .onConflictDoUpdate({ target: config.key, set: { value } })
        .run();
    }
  }
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return key ? "****" : "";
  return key.slice(0, 4) + "****" + key.slice(-4);
}
