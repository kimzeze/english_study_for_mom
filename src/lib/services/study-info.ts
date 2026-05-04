import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sentences } from "@/lib/db/schema";
import type { StudyInfo } from "@/lib/db/schema";
import { getAnthropic, CLAUDE_MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You generate Korean-language English study notes for a 50-60 year old learner.

Output ONLY a valid JSON object with this shape:
{
  "translation": "한국어 번역 (자연스럽고 실생활 표현)",
  "wordNotes": [
    { "word": "core word", "meaning": "한국어 뜻", "pronunciation": "한글 발음 표기 (선택, 어려운 단어만)" }
  ],
  "similarSentences": [
    "alternative phrasing 1",
    "alternative phrasing 2"
  ],
  "usageContext": "이 문장을 일상에서 어떤 상황에 쓰는지 친근하고 따뜻한 한국어로 2~3문장 설명"
}

Rules:
- "wordNotes": 2~4개 핵심 단어/숙어. 너무 쉬운 단어(I, am, the 등)는 제외.
- "pronunciation": 발음이 까다로운 단어에만 한글 표기. 쉬운 단어는 빈 문자열 또는 생략.
- "similarSentences": 같은 의미의 다른 표현 2~3개. 너무 어렵지 않게.
- "usageContext": 50~60대 학습자에게 친근한 톤으로. "~할 때 쓸 수 있어요" 같은 어투.
- 모든 한국어는 자연스럽고 정중하게.`;

/**
 * 한 문장의 학습 정보(번역/단어/유사문장/상황)를 Claude로 생성하고 DB에 저장.
 * 이미 study_info가 있으면 즉시 반환 (재호출해도 비용 0).
 */
export async function ensureStudyInfo(
  sentenceId: number
): Promise<StudyInfo | null> {
  const [existing] = await db
    .select()
    .from(sentences)
    .where(eq(sentences.id, sentenceId))
    .limit(1);

  if (!existing) return null;
  if (existing.studyInfo) return existing.studyInfo;

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: existing.text }],
  });

  const block = response.content[0];
  if (block.type !== "text") return null;

  const cleaned = block.text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  let info: StudyInfo;
  try {
    info = JSON.parse(cleaned) as StudyInfo;
  } catch {
    return null;
  }

  await db
    .update(sentences)
    .set({ studyInfo: info })
    .where(eq(sentences.id, sentenceId));

  return info;
}
