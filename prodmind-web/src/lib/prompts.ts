import fs from "fs";
import path from "path";

const promptsDir = path.join(process.cwd(), "prompts");

const cache = new Map<string, string>();

export function loadPrompt(filename: string): string {
  if (cache.has(filename)) return cache.get(filename)!;
  const content = fs.readFileSync(path.join(promptsDir, filename), "utf-8");
  cache.set(filename, content);
  return content;
}
