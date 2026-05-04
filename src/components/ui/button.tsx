import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "bg-terracotta text-cream shadow-soft hover:bg-[#a0512f] hover:shadow-soft-lg",
        secondary:
          "bg-ink text-cream shadow-soft hover:bg-[#33302a]",
        outline:
          "bg-cream-soft text-ink border-2 border-divider hover:border-ink-muted",
        ghost: "bg-transparent text-ink hover:bg-cream-soft",
        sage: "bg-sage text-cream shadow-soft hover:bg-[#4d6849]",
      },
      size: {
        xl: "h-16 px-8 text-[22px]",
        lg: "h-14 px-6 text-[20px]",
        md: "h-12 px-5 text-[18px]",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "xl",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
