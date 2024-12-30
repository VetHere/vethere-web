import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label
        className={cn("flex items-center space-x-2 cursor-pointer", className)}
      >
        <input
          type="radio"
          className="form-radio h-4 w-4 text-primary border-gray-300 focus:ring-primary"
          ref={ref}
          {...props}
        />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </label>
    );
  }
);

RadioButton.displayName = "RadioButton";

export { RadioButton };
