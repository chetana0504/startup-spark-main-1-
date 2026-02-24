import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MeetingSuccessRateProps {
  positive: number;
  negative: number;
  total: number;
}

export function MeetingSuccessRate({ positive, negative, total }: MeetingSuccessRateProps) {
  const successRate = total > 0 ? Math.round((positive / total) * 100) : 0;
  const negativeRate = total > 0 ? Math.round((negative / total) * 100) : 0;

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-success" />
          Meeting Success Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-success">
              <TrendingUp className="h-3 w-3" />
              Positive Insights
            </span>
            <span className="font-medium">{positive} ({successRate}%)</span>
          </div>
          <Progress value={successRate} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-destructive">
              <TrendingDown className="h-3 w-3" />
              Needs Improvement
            </span>
            <span className="font-medium">{negative} ({negativeRate}%)</span>
          </div>
          <Progress value={negativeRate} className="h-2 [&>div]:bg-destructive" />
        </div>
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total Meetings</span>
            <span className="font-medium text-foreground">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
