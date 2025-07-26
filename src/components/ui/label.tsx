import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

// Define the props type for the Label component
type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants> & {
    children?: React.ReactNode; // Make children optional
    className?: string; // Ensure className is optional
  };

// Use forwardRef to create the Label component
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)} // Combine class names
      {...props}
    >
      {children} {/* Pass children to the LabelPrimitive.Root */}
    </LabelPrimitive.Root>
  )
);

// Set the display name for debugging
Label.displayName = "Label"; // You can also use LabelPrimitive.Root.displayName if needed

export { Label };