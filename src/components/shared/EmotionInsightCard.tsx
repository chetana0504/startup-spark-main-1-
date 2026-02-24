import { cn } from "@/lib/utils";
import { Heart, Users, Zap, AlertTriangle, MessageCircle } from "lucide-react";

interface ConflictPoint {
  topic: string;
  participants: string[];
  resolution: string;
}

interface EnergyMoment {
  type: string;
  description: string;
  participants: string[];
}

interface EmotionInsightProps {
  overallMood: string;
  confidenceLevel: number;
  agreementLevel: number;
  conflictPoints: ConflictPoint[];
  energyMoments: EnergyMoment[];
  recommendations: string[];
}

export function EmotionInsightCard({
  overallMood,
  confidenceLevel,
  agreementLevel,
  conflictPoints,
  energyMoments,
  recommendations,
}: EmotionInsightProps) {
  const getMoodConfig = (mood: string) => {
    switch (mood.toLowerCase()) {
      case "positive":
        return { bgClass: "bg-success/10", textClass: "text-success", borderClass: "border-success/30" };
      case "tense":
        return { bgClass: "bg-destructive/10", textClass: "text-destructive", borderClass: "border-destructive/30" };
      case "mixed":
        return { bgClass: "bg-warning/10", textClass: "text-warning", borderClass: "border-warning/30" };
      default:
        return { bgClass: "bg-muted/30", textClass: "text-muted-foreground", borderClass: "border-muted-foreground/30" };
    }
  };

  const moodConfig = getMoodConfig(overallMood);

  const getResolutionBadge = (resolution: string) => {
    switch (resolution.toLowerCase()) {
      case "resolved":
        return { bgClass: "bg-success/20", textClass: "text-success" };
      case "unresolved":
        return { bgClass: "bg-destructive/20", textClass: "text-destructive" };
      default:
        return { bgClass: "bg-warning/20", textClass: "text-warning" };
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Mood & Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn("p-3 rounded-lg border text-center", moodConfig.bgClass, moodConfig.borderClass)}>
          <Heart className={cn("h-5 w-5 mx-auto mb-1", moodConfig.textClass)} />
          <p className="text-xs text-muted-foreground">Mood</p>
          <p className={cn("text-sm font-semibold", moodConfig.textClass)}>{overallMood}</p>
        </div>
        
        <div className="p-3 rounded-lg border bg-primary/10 border-primary/30 text-center">
          <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className="text-sm font-semibold text-primary">{confidenceLevel}%</p>
        </div>
        
        <div className="p-3 rounded-lg border bg-info/10 border-info/30 text-center">
          <Users className="h-5 w-5 mx-auto mb-1 text-info" />
          <p className="text-xs text-muted-foreground">Agreement</p>
          <p className="text-sm font-semibold text-info">{agreementLevel}%</p>
        </div>
      </div>

      {/* Conflict Points */}
      {conflictPoints && conflictPoints.length > 0 && (
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-semibold text-foreground">Conflict Points Detected</span>
          </div>
          <div className="space-y-2">
            {conflictPoints.map((conflict, index) => {
              const badge = getResolutionBadge(conflict.resolution);
              return (
                <div key={index} className="flex items-start justify-between gap-2 p-2 rounded bg-background/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{conflict.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {conflict.participants.join(", ")}
                    </p>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", badge.bgClass, badge.textClass)}>
                    {conflict.resolution}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Energy Moments */}
      {energyMoments && energyMoments.length > 0 && (
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">Energy Moments</span>
          </div>
          <div className="space-y-2">
            {energyMoments.map((moment, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className={cn(
                  "mt-1 px-1.5 py-0.5 rounded text-xs font-medium uppercase",
                  moment.type === "high" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                )}>
                  {moment.type}
                </span>
                <span className="text-muted-foreground">{moment.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Team Dynamics Recommendations</span>
          </div>
          <ul className="space-y-1.5">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
