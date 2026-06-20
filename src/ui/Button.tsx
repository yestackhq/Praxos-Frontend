import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[transform,background-color,border-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aubergine/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-bg hover:opacity-90",
        secondary: "border border-border bg-surface text-ink hover:border-soft hover:bg-[#3c315b]/5",
        ghost: "text-soft hover:bg-[#3c315b]/5 hover:text-ink",
        outline: "border border-border text-ink hover:border-soft hover:bg-[#3c315b]/5",
        danger: "border border-border bg-surface text-ink hover:border-red-500/60 hover:text-red-300",
      },
      size: {
        sm: "h-8 px-3 text-label [&_svg]:size-3.5",
        md: "h-10 px-4 text-label [&_svg]:size-4",
        lg: "h-12 px-6 text-body [&_svg]:size-[18px]",
        icon: "size-9 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { button as buttonVariants };
