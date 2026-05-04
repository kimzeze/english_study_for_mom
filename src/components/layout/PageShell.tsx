import * as React from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-dvh bg-paper py-8 sm:py-12", className)}>
      <div className="content-column">{children}</div>
    </div>
  );
}
