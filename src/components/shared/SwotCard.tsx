import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react";

type SwotType = "strengths" | "weaknesses" | "opportunities" | "threats";

interface SwotCardProps {
  type: SwotType;
  items: string[];
}

const swotConfig: Record<SwotType, { 
  label: string; 
  icon: typeof TrendingUp;
  bgClass: string;
  borderClass: string;
  iconClass: string;
}> = {
  strengths: {
    label: "Strengths",
    icon: TrendingUp,
    bgClass: "bg-success/10",
    borderClass: "border-success/30",
    iconClass: "text-success",
  },
  weaknesses: {
    label: "Weaknesses",
    icon: TrendingDown,
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/30",
    iconClass: "text-destructive",
  },
  opportunities: {
    label: "Opportunities",
    icon: Zap,
    bgClass: "bg-primary/10",
    borderClass: "border-primary/30",
    iconClass: "text-primary",
  },
  threats: {
    label: "Threats",
    icon: AlertTriangle,
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
    iconClass: "text-warning",
  },
};

export function SwotCard({ type, items }: SwotCardProps) {
  const config = swotConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02]",
      config.bgClass,
      config.borderClass
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("h-5 w-5", config.iconClass)} />
        <h4 className="font-display font-semibold text-foreground">
          {config.label}
        </h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li 
            key={index}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0", config.iconClass.replace("text-", "bg-"))} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
