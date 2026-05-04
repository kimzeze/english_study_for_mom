import { NextResponse } from "next/server";
import { z } from "zod";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sentences } from "@/lib/db/schema";
import { getOpenAI } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  sentenceId: z.number().int().positive(),
  text: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { sentenceId, text } = parsed.data;

  // 캐시 확인 — DB에 audio_url이 있으면 재사용
  const [existing] = await db
    .select()
    .from(sentences)
    .where(eq(sentences.id, sentenceId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Sentence not found" }, { status: 404 });
  }

  if (existing.audioUrl) {
    return NextResponse.json({ audioUrl: existing.audioUrl, cached: true });
  }

  // OpenAI TTS 호출 (tts-1, voice: nova - 따뜻한 여성 보이스)
  const openai = getOpenAI();
  const speech = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
    response_format: "mp3",
    speed: 0.95, // 살짝 천천히 (학습용)
  });

  const audioBuffer = Buffer.from(await speech.arrayBuffer());

  // Vercel Blob에 업로드
  const blob = await put(
    `audio/${existing.date}/${sentenceId}.mp3`,
    audioBuffer,
    {
      access: "public",
      contentType: "audio/mpeg",
      addRandomSuffix: false,
    }
  );

  // DB 업데이트
  await db
    .update(sentences)
    .set({ audioUrl: blob.url })
    .where(eq(sentences.id, sentenceId));

  return NextResponse.json({ audioUrl: blob.url, cached: false });
}
