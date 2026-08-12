import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide neo-border neo-shadow transition-all neo-press focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
        outline:
          "bg-white text-black hover:bg-gray-50 active:bg-gray-100",
        secondary:
          "bg-pink-500 text-white hover:bg-pink-600 active:bg-pink-700",
        ghost: "bg-transparent border-none shadow-none hover:bg-gray-100 active:bg-gray-200",
        link: "text-blue-500 underline-offset-4 hover:underline border-none shadow-none",
        success: "bg-green-500 text-white hover:bg-green-600 active:bg-green-700",
        warning: "bg-yellow-400 text-black hover:bg-yellow-500 active:bg-yellow-600",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
