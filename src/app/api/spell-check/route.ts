import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropic, CLAUDE_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

const Body = z.object({
  text: z.string().min(1).max(500),
});

const SYSTEM_PROMPT = `You are an English spelling and grammar corrector for a Korean parent's daily English study.

CRITICAL RULES:
1. ONLY fix spelling, typos, basic grammar (verb tense, articles, plurals).
2. NEVER change the meaning or intent of the sentence.
3. NEVER substitute words with synonyms unless the original is misspelled.
4. NEVER restructure the sentence beyond what's needed for grammatical correctness.
5. If the sentence is already correct, return it unchanged.
6. If the input is unclear or could mean multiple things, return it unchanged.

Return ONLY a valid JSON object with this exact shape:
{
  "corrected": "the corrected sentence",
  "changed": true | false,
  "reason": "brief one-line reason in Korean if changed, empty string if not"
}

Examples:
- "I goed to school" → {"corrected":"I went to school","changed":true,"reason":"goed → went (불규칙 동사)"}
- "i have a apple" → {"corrected":"I have an apple","changed":true,"reason":"a → an, 대문자 I"}
- "What time is it?" → {"corrected":"What time is it?","changed":false,"reason":""}
- "I want eat lunch" → {"corrected":"I want to eat lunch","changed":true,"reason":"want 뒤에 to 필요"}`;

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { text } = parsed.data;

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    return NextResponse.json({ corrected: text, changed: false, reason: "" });
  }

  // JSON 파싱 (코드 펜스가 섞일 수 있어 robust하게)
  const cleaned = block.text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const result = JSON.parse(cleaned) as {
      corrected: string;
      changed: boolean;
      reason: string;
    };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ corrected: text, changed: false, reason: "" });
  }
}
