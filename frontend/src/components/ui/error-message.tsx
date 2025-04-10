import React from "react";
import { cn } from "@/lib/utils";
import { RefreshCcw, AlertCircle, XCircle, Info } from "lucide-react";
import { Button } from "./button";
import { cva, type VariantProps } from "class-variance-authority";

const errorMessageVariants = cva(
  "relative w-full rounded-lg p-4 text-center flex flex-col items-center justify-center transition-all duration-300 min-h-[120px] border shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-200/40 text-red-600 dark:text-red-400",
        warning: "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/40 text-amber-600 dark:text-amber-400",
        info: "bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/40 text-blue-600 dark:text-blue-400",
      },
      animation: {
        pulse: "animate-pulse",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animation: "none",
    },
  }
);

export interface ErrorMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorMessageVariants> {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
  retryText?: string;
  showRetry?: boolean;
}

const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ 
    className, 
    variant, 
    animation,
    title, 
    message, 
    icon, 
    onRetry, 
    retryText = "Intentar nuevamente", 
    showRetry = true,
    ...props 
  }, ref) => {
    // Determina el icono en base a la variante si no se proporciona uno
    const defaultIcon = () => {
      switch (variant) {
        case "warning":
          return <AlertCircle className="h-10 w-10 mb-2 text-amber-500" />;
        case "info":
          return <Info className="h-10 w-10 mb-2 text-blue-500" />;
        default:
          return <XCircle className="h-10 w-10 mb-2 text-red-500" />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(errorMessageVariants({ variant, animation }), className)}
        {...props}
      >
        {icon || defaultIcon()}
        
        {title && (
          <h4 className="font-semibold text-lg mb-1">{title}</h4>
        )}
        
        <p className="text-sm mb-4">{message}</p>
        
        {showRetry && onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className={cn(
              "transition-all duration-300",
              variant === "warning" && "hover:border-amber-500 hover:text-amber-600",
              variant === "info" && "hover:border-blue-500 hover:text-blue-600",
              variant === "default" && "hover:border-red-500 hover:text-red-600",
            )}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {retryText}
          </Button>
        )}
      </div>
    );
  }
);

ErrorMessage.displayName = "ErrorMessage";

export { ErrorMessage }; 