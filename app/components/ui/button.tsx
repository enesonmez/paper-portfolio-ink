import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "~/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-none border-2 border-black font-sans text-sm font-semibold uppercase tracking-[0.08em]",
    "transition-transform duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:dark:shadow-none",
        secondary:
          "bg-card text-card-foreground cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:dark:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:dark:shadow-none",
      },
      size: {
        default: "min-h-12 px-5 py-3",
        lg: "min-h-14 px-6 py-4 text-base",
        icon: "size-12 p-0",
        sm: "min-h-10 px-3 py-2 text-[10px]",
        iconSm: "size-10 p-0",
        xl: "min-h-16 px-5 py-4 text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ className, variant, size }))}
      {...props}
    />
  );
}
