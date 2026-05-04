import Link from "next/link";
import { db } from "@/lib/db";
import { dayPosts, sentences } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatDateShort, todayKey } from "@/lib/utils";

export async function RecentDayList() {
  let days: { date: string }[] = [];
  let dbError = false;
  try {
    days = await db
      .select()
      .from(dayPosts)
      .orderBy(desc(dayPosts.date))
      .limit(14);
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

  // 각 날짜의 첫 문장 가져오기
  const previews = await Promise.all(
    days.map(async (d) => {
      const [first] = await db
        .select({ text: sentences.text })
        .from(sentences)
        .where(eq(sentences.date, d.date))
        .orderBy(sentences.orderIndex)
        .limit(1);
      return { date: d.date, preview: first?.text ?? "" };
    })
  );

  const today = todayKey();

  return (
    <ul className="space-y-3">
      {previews.map(({ date, preview }) => (
        <li key={date}>
          <Link
            href={`/${date}`}
            className="block rounded-2xl bg-cream-soft p-5 shadow-soft transition-all hover:shadow-soft-lg hover:bg-[#EDE6D5]"
          >
            <div className="flex items-baseline gap-2 text-[18px] font-medium text-ink-muted">
              <span>{formatDateShort(date)}</span>
              {date === today && (
                <span className="text-terracotta">(오늘)</span>
              )}
            </div>
            {preview && (
              <p className="mt-2 line-clamp-2 text-[20px] text-ink">
                &ldquo;{preview}&rdquo;
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
