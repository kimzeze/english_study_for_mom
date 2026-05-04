import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureStudyInfo } from "@/lib/services/study-info";

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

  const info = await ensureStudyInfo(parsed.data.sentenceId);
  if (!info) {
    return NextResponse.json(
      { error: "Sentence not found or AI failed" },
      { status: 500 }
    );
  }
  return NextResponse.json(info);
}
