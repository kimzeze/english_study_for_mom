import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dayPosts, sentences } from "@/lib/db/schema";
import { isValidDateKey } from "@/lib/utils";

export const runtime = "nodejs";

const Body = z.object({
  date: z
    .string()
    .refine(isValidDateKey, "Invalid date (must be YYYY-MM-DD)"),
  texts: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.format() },
      { status: 400 }
    );
  }
  const { date, texts } = parsed.data;

  // upsert dayPost
  await db
    .insert(dayPosts)
    .values({ date })
    .onConflictDoNothing();

  // 기존 sentences가 있으면 모두 삭제 후 재삽입 (단순화)
  await db.delete(sentences).where(eq(sentences.date, date));

  // 새 sentences 삽입
  const inserted = await db
    .insert(sentences)
    .values(
      texts.map((text, i) => ({
        date,
        orderIndex: i + 1,
        text,
      }))
    )
    .returning();

  return NextResponse.json({
    date,
    sentences: inserted,
  });
}

export async function GET() {
  // 최근 14일치 dayPost + 첫 문장 미리보기
  const recent = await db
    .select()
    .from(dayPosts)
    .orderBy(dayPosts.date)
    .limit(14);

  return NextResponse.json({ days: recent.reverse() });
}
