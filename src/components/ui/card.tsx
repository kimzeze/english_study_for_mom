import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl bg-paper-soft p-5 shadow-soft transition-shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
