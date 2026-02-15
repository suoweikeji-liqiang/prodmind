import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, messages, conflictEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { exportToMarkdown, exportToJSON } from "@/lib/engine/export";
import type { SessionInfo, MessageInfo, ConflictEventInfo } from "@/types";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "md";

  const sessionRows = await db.select().from(sessions).where(eq(sessions.id, id));
  const session = sessionRows[0];
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, id))
    .orderBy(messages.round, messages.id);

  const conflicts = await db
    .select()
    .from(conflictEvents)
    .where(eq(conflictEvents.sessionId, id))
    .orderBy(conflictEvents.round, conflictEvents.id);

  const sessionInfo = session as unknown as SessionInfo;
  const msgsInfo = msgs as unknown as MessageInfo[];
  const conflictsInfo = conflicts as unknown as ConflictEventInfo[];

  if (format === "json") {
    const content = exportToJSON(sessionInfo, msgsInfo, conflictsInfo);
    return new Response(content, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="prodmind-${id}.json"`,
      },
    });
  }

  const content = exportToMarkdown(sessionInfo, msgsInfo, conflictsInfo);
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="prodmind-${id}.md"`,
    },
  });
}
