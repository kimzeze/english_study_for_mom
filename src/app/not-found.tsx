import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="space-y-8 pt-12 text-center">
        <h1 className="text-[40px] font-bold text-ink leading-tight">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-[22px] text-ink-muted">
          이 날짜에 올라온 문장이 아직 없어요
        </p>
        <Button asChild block size="xl" variant="primary">
          <Link href="/">처음으로 돌아가기</Link>
        </Button>
      </div>
    </PageShell>
  );
}
