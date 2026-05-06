import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function DateLoading() {
  return (
    <PageShell>
      <div className="space-y-12">
        <Skeleton className="h-7 w-32 rounded-md" />

        <header className="space-y-6">
          <Skeleton className="h-20 w-3/5 rounded-xl" />
          <Skeleton className="h-9 w-2/3 rounded-lg" />
        </header>

        <div className="space-y-12">
          {[0, 1, 2].map((i) => (
            <article key={i} className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-divider" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <span className="h-px flex-1 bg-divider" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-14 w-32 rounded-2xl" />
              <Skeleton className="h-12 w-40 rounded-full" />
              <div className="flex justify-end">
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
            </article>
          ))}
        </div>

        <div className="pt-4">
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </PageShell>
  );
}
