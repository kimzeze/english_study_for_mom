import "server-only";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { sentences } from "@/lib/db/schema";
import { getOpenAI } from "@/lib/openai";

/**
 * 한 문장의 TTS 음성을 생성하고 Vercel Blob에 업로드 후 DB에 audio_url 저장.
 * 이미 audio_url이 있으면 즉시 반환 (재호출해도 비용 0).
 */
export async function ensureTtsAudio(
  sentenceId: number
): Promise<{ audioUrl: string; cached: boolean } | null> {
  const [existing] = await db
    .select()
    .from(sentences)
    .where(eq(sentences.id, sentenceId))
    .limit(1);

  if (!existing) return null;
  if (existing.audioUrl) {
    return { audioUrl: existing.audioUrl, cached: true };
  }

  const openai = getOpenAI();
  const speech = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: existing.text,
    response_format: "mp3",
    speed: 0.8,
  });

  const audioBuffer = Buffer.from(await speech.arrayBuffer());

  const blob = await put(
    `audio/${existing.date}/${sentenceId}.mp3`,
    audioBuffer,
    {
      access: "public",
      contentType: "audio/mpeg",
      addRandomSuffix: false,
    }
  );

  await db
    .update(sentences)
    .set({ audioUrl: blob.url })
    .where(eq(sentences.id, sentenceId));

  return { audioUrl: blob.url, cached: false };
}
