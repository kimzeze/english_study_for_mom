import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { sentences } from "@/lib/db/schema";
import { PageShell } from "@/components/layout/PageShell";
import { BigDate } from "@/components/date/BigDate";
import { SentenceCard } from "@/components/sentence/SentenceCard";
import { CopyLinkButton } from "@/components/sentence/CopyLinkButton";
import { isValidDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isValidDateKey(date)) notFound();

  const items = await db
    .select()
    .from(sentences)
    .where(eq(sentences.date, date))
    .orderBy(asc(sentences.orderIndex));

  if (items.length === 0) notFound();

  return (
    <PageShell>
      <div className="space-y-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[20px] font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>처음으로</span>
        </Link>

        <header className="space-y-6">
          <BigDate date={date} />
          <h2 className="text-[32px] font-bold text-ink leading-tight">
            오늘의 영어 문장
          </h2>
        </header>

        <div className="space-y-12">
          {items.map((s, i) => (
            <SentenceCard key={s.id} sentence={s} index={i} />
          ))}
        </div>

        <div className="pt-4">
          <CopyLinkButton date={date} />
        </div>
      </div>
    </PageShell>
  );
}
