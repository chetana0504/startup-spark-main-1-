import { cn } from "@/lib/utils";
import { User, AlertCircle, CheckCircle2 } from "lucide-react";

interface FounderReadinessProps {
  score: number;
  skillGaps: string[];
  recommendation: string;
}

export function FounderReadinessCard({ score, skillGaps, recommendation }: FounderReadinessProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-primary";
    if (score >= 40) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary/50 border border-border">
          <User className={cn("h-6 w-6", getScoreColor(score))} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Founder Readiness</span>
            <span className={cn("text-2xl font-bold font-display", getScoreColor(score))}>
              {score}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(score))}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Skill Gaps */}
      {skillGaps.length > 0 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-foreground">Skill Gaps</span>
          </div>
          <ul className="space-y-1">
            {skillGaps.map((gap, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Recommendation</span>
        </div>
        <p className="text-sm text-muted-foreground">{recommendation}</p>
      </div>
    </div>
  );
}
