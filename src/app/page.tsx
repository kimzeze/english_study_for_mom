import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { RecentDayList } from "@/components/home/RecentDayList";

// 홈은 mutation(POST /api/sentences) 시 revalidatePath('/')로 명시적 무효화.
// 추가 안전망: "오늘" 배지가 자정 넘어 너무 오래 stale되지 않도록 10분 시간 기반 재검증.
export const revalidate = 600;

export default function HomePage() {
  return (
    <PageShell>
      <div className="space-y-12">
        <header className="space-y-3 pt-8">
          <h1 className="text-[56px] font-bold leading-tight text-ink tracking-tight">
            영어 공부하기
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
