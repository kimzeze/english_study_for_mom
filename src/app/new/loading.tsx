import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewLoading() {
  return (
    <PageShell>
      <div className="space-y-10">
        <Skeleton className="h-7 w-28 rounded-md" />
        <Skeleton className="h-20 w-3/5 rounded-xl" />
        <Skeleton className="h-9 w-2/3 rounded-lg" />

        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ))}
        </div>

        <Skeleton className="h-16 w-full rounded-full" />
      </div>
    </PageShell>
  );
}
