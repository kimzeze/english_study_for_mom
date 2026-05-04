import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sentences } from "@/lib/db/schema";
import type { StudyInfo } from "@/lib/db/schema";
import { getAnthropic, CLAUDE_MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `당신은 한국 50~60대 학습자를 위한 영어 학습 자료를 만드는 전문가입니다.
시중의 한국 성인 영어 회화책(예: "왕초보 영어회화", "엄마표 영어")의 친절한 톤을 따라주세요.

다음 JSON 형식으로만 출력하세요. 다른 설명 금지.

{
  "translation": "자연스러운 한국어 의역. 직역체 금지. 50대 이상이 일상에서 실제로 쓸 만한 표현으로.",
  "pronunciation": "전체 문장의 한글 발음 표기. 자연스러운 연음 반영. 예: 'What time is it?' → '왓 타이미짓?' / 'I would like a coffee.' → '아이 우드 라이커 커피'",
  "wordNotes": [
    {
      "word": "원형 단어 또는 짧은 숙어 (소문자)",
      "pronunciation": "한글 발음 (예: '스쿨', '컴포터블')",
      "meaning": "한국어 뜻 (간결하게)",
      "example": "이 단어가 들어간 짧은 영어 예문 한 개 (선택, 도움 될 때만)"
    }
  ],
  "grammarTip": "이 문장에서 50~60대가 헷갈리기 쉬운 어법/문법 포인트를 한국어로 1~2문장. 예: '\\'would like\\'는 \\'want\\'보다 정중한 표현입니다.' 특별한 게 없으면 빈 문자열 \\"\\".",
  "similarSentences": [
    { "english": "비슷한 의미의 다른 표현 1", "korean": "한국어 번역" },
    { "english": "비슷한 의미의 다른 표현 2", "korean": "한국어 번역" }
  ],
  "usageContext": "이 표현을 일상에서 어떤 상황에 쓰는지 친근한 한국어로 2~3문장. '~할 때 쓸 수 있어요', '~한 자리에서 자연스러워요' 같은 어투. 가능하면 짧은 상황 대화 한 줄 포함."
}

규칙:
- "wordNotes": 2~4개. 핵심 단어/숙어만. 너무 쉬운 단어(I, am, the, a, is, of 등)는 제외.
- "pronunciation"은 필수. 한국 학습서 스타일의 한글 표기로. IPA(국제음성기호)는 절대 쓰지 말 것.
- 모든 한국어는 50~60대가 편하게 읽을 수 있는 자연스러운 정중체로.
- "similarSentences"는 너무 어렵지 않은 표현으로 2~3개.
- JSON 외 다른 출력 금지. 마크다운 코드펜스 금지.`;

/**
 * 한 문장의 학습 정보(번역/한글발음/단어/문법팁/유사표현/상황)를 Claude로 생성하고 DB에 저장.
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
    max_tokens: 2000,
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
