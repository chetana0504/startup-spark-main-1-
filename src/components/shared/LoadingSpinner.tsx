import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  variant?: "spinner" | "ai";
}

export function LoadingSpinner({ 
  size = "md", 
  text = "Loading...",
  variant = "spinner"
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (variant === "ai") {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <div className={cn(
            "relative flex items-center justify-center rounded-full gradient-primary animate-spin-slow",
            sizeClasses[size],
            size === "lg" && "h-16 w-16"
          )}>
            <Sparkles className={cn(
              "text-primary-foreground",
              size === "sm" && "h-2 w-2",
              size === "md" && "h-4 w-4",
              size === "lg" && "h-6 w-6"
            )} />
          </div>
        </div>
        {text && (
          <p className={cn("text-muted-foreground animate-pulse", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className={cn("text-muted-foreground", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
}
