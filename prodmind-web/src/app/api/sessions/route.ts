import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  const rows = await db.select().from(sessions).orderBy(desc(sessions.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { idea, locale } = await request.json();
  if (!idea || typeof idea !== "string") {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }

  const id = nanoid(8);
  const now = new Date().toISOString();
  const title = idea.slice(0, 30);

  await db.insert(sessions).values({
    id,
    title,
    idea,
    status: "active",
    currentRound: 0,
    debatePhase: "idle",
    locale: locale || "zh",
    createdAt: now,
    updatedAt: now,
  });

  const allSessions = await db.select().from(sessions);
  const session = allSessions.find((s) => s.id === id);
  return NextResponse.json(session, { status: 201 });
}
