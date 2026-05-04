import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { RecentDayList } from "@/components/home/RecentDayList";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <PageShell>
      <div className="space-y-12">
        <header className="space-y-3 pt-8">
          <h1 className="text-[56px] font-bold leading-tight text-ink tracking-tight">
            엄마 영어
          </h1>
          <p className="text-[22px] text-ink-muted">
            오늘의 영어, 또박또박
          </p>
        </header>

        <div>
          <Button asChild block size="xl" variant="primary">
            <Link href="/new">
              <Pencil className="h-6 w-6" />
              <span>오늘 문장 올리기</span>
            </Link>
          </Button>
        </div>

        <section className="space-y-4">
          <h2 className="text-[18px] font-medium text-ink-muted">
            지난 학습
          </h2>
          <RecentDayList />
        </section>
      </div>
    </PageShell>
  );
}
