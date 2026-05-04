import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { dayPosts, sentences as sentencesTable } from "@/lib/db/schema";
import { desc, eq, asc } from "drizzle-orm";
import type { Sentence } from "@/lib/db/schema";
import { formatDateShort, todayKey } from "@/lib/utils";
import { PlayButton } from "@/components/sentence/PlayButton";
import { TranslationToggle } from "@/components/sentence/TranslationToggle";

export async function RecentDayList() {
  let days: { date: string }[] = [];
  let dbError = false;
  try {
    days = await db
      .select()
      .from(dayPosts)
      .orderBy(desc(dayPosts.date))
      .limit(7);
  } catch {
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="rounded-2xl bg-cream-soft p-6 text-center">
        <p className="text-[20px] text-ink-muted">
          데이터베이스가 아직 연결되지 않았어요
        </p>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="rounded-2xl bg-cream-soft p-6 text-center">
        <p className="text-[20px] text-ink-muted">
          아직 올린 문장이 없어요
        </p>
      </div>
    );
  }

  // 각 날짜의 모든 문장 가져오기
  const daySentences = await Promise.all(
    days.map(async (d) => {
      const items: Sentence[] = await db
        .select()
        .from(sentencesTable)
        .where(eq(sentencesTable.date, d.date))
        .orderBy(asc(sentencesTable.orderIndex));
      return { date: d.date, items };
    })
  );

  const today = todayKey();

  return (
    <ul className="space-y-5">
      {daySentences.map(({ date, items }) => (
        <li
          key={date}
          className="rounded-2xl border border-divider bg-cream-soft shadow-soft"
        >
          <header className="flex items-baseline justify-between gap-3 border-b border-divider px-5 py-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-semibold text-ink">
                {formatDateShort(date)}
              </span>
              {date === today && (
                <span className="text-[16px] font-medium text-terracotta">
                  오늘
                </span>
              )}
              <span className="text-[16px] text-ink-muted">
                · {items.length}문장
              </span>
            </div>
            <Link
              href={`/${date}`}
              className="inline-flex items-center gap-1 text-[18px] font-medium text-ink hover:text-terracotta transition-colors"
            >
              <span>자세히 보기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          {items.length === 0 ? (
            <div className="p-5">
              <p className="text-[18px] text-ink-muted">
                문장이 없어요
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-divider">
              {items.map((s) => (
                <li key={s.id} className="space-y-3 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <p className="flex-1 text-[22px] font-semibold text-ink leading-snug">
                      {s.text}
                    </p>
                    <PlayButton
                      variant="compact"
                      sentenceId={s.id}
                      text={s.text}
                      audioUrl={s.audioUrl}
                    />
                  </div>
                  <TranslationToggle
                    sentenceId={s.id}
                    text={s.text}
                    initialInfo={s.studyInfo ?? null}
                  />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
