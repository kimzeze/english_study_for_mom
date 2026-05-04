import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { eq, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { dayPosts, sentences } from "@/lib/db/schema";
import { isValidDateKey } from "@/lib/utils";
import { ensureTtsAudio } from "@/lib/services/tts";
import { ensureStudyInfo } from "@/lib/services/study-info";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  // 응답 후 백그라운드에서 TTS + 학습정보 사전 생성 (사용자 대기시간 0)
  // Vercel Functions에서 응답 송신 후에도 실행됨. 모든 호출이 실패해도 응답은 영향 없음.
  after(async () => {
    const tasks = inserted.flatMap((s) => [
      ensureTtsAudio(s.id).catch((e) =>
        console.error(`TTS warmup failed for #${s.id}`, e)
      ),
      ensureStudyInfo(s.id).catch((e) =>
        console.error(`Study-info warmup failed for #${s.id}`, e)
      ),
    ]);
    await Promise.allSettled(tasks);
  });

  return NextResponse.json({
    date,
    sentences: inserted,
  });
}

export async function GET() {
  const recent = await db
    .select()
    .from(dayPosts)
    .orderBy(dayPosts.date)
    .limit(14);

  return NextResponse.json({ days: recent.reverse() });
}
