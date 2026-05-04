import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, max } from "drizzle-orm";
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

  // 기존 문장에 이어붙이기 — 가장 큰 order_index를 찾아 그 다음부터 부여
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(sentences.orderIndex) })
    .from(sentences)
    .where(eq(sentences.date, date));

  const startIndex = (maxOrder ?? 0) + 1;

  const inserted = await db
    .insert(sentences)
    .values(
      texts.map((text, i) => ({
        date,
        orderIndex: startIndex + i,
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
