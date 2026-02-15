import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, messages, conflictEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  return NextResponse.json({ session, messages: msgs, conflicts });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(sessions).where(eq(sessions.id, id));
  return NextResponse.json({ ok: true });
}
