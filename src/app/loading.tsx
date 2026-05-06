import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <PageShell>
      <div className="space-y-12">
        <header className="space-y-3 pt-8">
          <Skeleton className="h-14 w-3/4 rounded-xl" />
          <Skeleton className="h-7 w-1/2 rounded-lg" />
        </header>

        <Skeleton className="h-16 w-full" />

        <section className="space-y-4">
          <Skeleton className="h-6 w-24 rounded-md" />
          <ul className="space-y-5">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="rounded-2xl border border-divider bg-paper-soft/60 shadow-soft"
              >
                <div className="flex items-baseline justify-between gap-3 border-b border-divider px-5 py-4">
                  <Skeleton className="h-6 w-28 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
                <div className="space-y-3 px-5 py-4">
                  <Skeleton className="h-6 w-5/6 rounded-md" />
                  <Skeleton className="h-5 w-2/3 rounded-md" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
