import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";

interface SecondOpinionProps {
  optimistic: string;
  pessimistic: string;
  neutral: string;
}

export function SecondOpinionCard({ optimistic, pessimistic, neutral }: SecondOpinionProps) {
  const opinions = [
    {
      type: "optimistic",
      label: "Optimistic View",
      content: optimistic,
      icon: TrendingUp,
      bgClass: "bg-success/10",
      borderClass: "border-success/30",
      iconClass: "text-success",
    },
    {
      type: "pessimistic",
      label: "Pessimistic View",
      content: pessimistic,
      icon: TrendingDown,
      bgClass: "bg-destructive/10",
      borderClass: "border-destructive/30",
      iconClass: "text-destructive",
    },
    {
      type: "neutral",
      label: "Neutral View",
      content: neutral,
      icon: Scale,
      bgClass: "bg-muted/30",
      borderClass: "border-muted-foreground/30",
      iconClass: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-3">
      {opinions.map((opinion) => {
        const Icon = opinion.icon;
        return (
          <div
            key={opinion.type}
            className={cn(
              "p-4 rounded-lg border transition-all",
              opinion.bgClass,
              opinion.borderClass
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5", opinion.iconClass)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">
                  {opinion.label}
                </p>
                <p className="text-sm text-muted-foreground">{opinion.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
