import { cn } from "@/lib/utils";
import { AlertTriangle, Scale, Cpu, DollarSign, Settings, Gavel } from "lucide-react";

interface RedFlag {
  type: string;
  title: string;
  description: string;
}

interface RedFlagsCardProps {
  redFlags: RedFlag[];
}

const typeConfig: Record<string, { icon: any; bgClass: string; borderClass: string; iconClass: string }> = {
  Legal: {
    icon: Gavel,
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/30",
    iconClass: "text-destructive",
  },
  Market: {
    icon: Scale,
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
    iconClass: "text-warning",
  },
  Technical: {
    icon: Cpu,
    bgClass: "bg-info/10",
    borderClass: "border-info/30",
    iconClass: "text-info",
  },
  Financial: {
    icon: DollarSign,
    bgClass: "bg-accent/10",
    borderClass: "border-accent/30",
    iconClass: "text-accent",
  },
  Operational: {
    icon: Settings,
    bgClass: "bg-muted/30",
    borderClass: "border-muted-foreground/30",
    iconClass: "text-muted-foreground",
  },
};

export function RedFlagsCard({ redFlags }: RedFlagsCardProps) {
  if (!redFlags || redFlags.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-success/10 border border-success/30 text-center">
        <div className="flex items-center justify-center gap-2 text-success">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">No major red flags detected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {redFlags.map((flag, index) => {
        const config = typeConfig[flag.type] || typeConfig.Operational;
        const Icon = config.icon;
        
        return (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg border transition-all",
              config.bgClass,
              config.borderClass
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5 p-1.5 rounded-lg bg-background/50", config.iconClass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {flag.type}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  ⚠️ {flag.title}
                </p>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
