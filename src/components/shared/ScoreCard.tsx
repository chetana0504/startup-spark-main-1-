import { cn } from "@/lib/utils";

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore?: number;
  colorClass?: string;
  icon?: React.ReactNode;
}

export function ScoreCard({ 
  label, 
  score, 
  maxScore = 100, 
  colorClass = "text-primary",
  icon 
}: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  
  const getColorByScore = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const dynamicColor = colorClass === "text-primary" ? getColorByScore(score) : colorClass;

  return (
    <div className="relative flex flex-col items-center p-4 rounded-xl bg-secondary/50 border border-border/50">
      {/* Circular Progress */}
      <div className="relative w-20 h-20 mb-3">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${percentage} 100`}
            className={cn("transition-all duration-1000 ease-out", dynamicColor)}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xl font-bold font-display", dynamicColor)}>
            {score}
          </span>
        </div>
      </div>
      
      {/* Label */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
}
