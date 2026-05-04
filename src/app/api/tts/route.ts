import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureTtsAudio } from "@/lib/services/tts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

  const result = await ensureTtsAudio(parsed.data.sentenceId);
  if (!result) {
    return NextResponse.json({ error: "Sentence not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
