
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-600/80 to-purple-500/80 text-white border-2 border-purple-500/50 hover:from-purple-600/90 hover:to-purple-500/90 hover:border-purple-500/70 hover:shadow-purple-500/20",
        destructive: "bg-gradient-to-r from-destructive/80 to-red-600/80 text-destructive-foreground border-2 border-destructive/50 hover:from-destructive/90 hover:to-red-600/90 hover:border-destructive/70 hover:shadow-destructive/20",
        outline: "border-2 border-input bg-gradient-to-r from-background/80 to-muted/40 hover:from-accent/80 hover:to-accent/60 hover:text-accent-foreground hover:border-accent/50 backdrop-blur-sm",
        secondary: "bg-gradient-to-r from-secondary/80 to-secondary/60 text-secondary-foreground border-2 border-secondary/50 hover:from-secondary/90 hover:to-secondary/70 hover:border-secondary/70",
        ghost: "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/60 hover:text-accent-foreground border-2 border-transparent hover:border-accent/30",
        link: "text-primary underline-offset-4 hover:underline border-2 border-transparent hover:border-primary/30 rounded-full",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-full px-3 py-1.5",
        lg: "h-12 rounded-full px-6 py-3 text-sm",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
