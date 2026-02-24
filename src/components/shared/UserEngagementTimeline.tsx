import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Lightbulb, Calendar, TrendingUp, Users, Download } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "idea" | "meeting" | "growth" | "cofounder" | "download";
  title: string;
  timestamp: string;
}

interface UserEngagementTimelineProps {
  events: TimelineEvent[];
}

export function UserEngagementTimeline({ events }: UserEngagementTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "idea":
        return <Lightbulb className="h-4 w-4 text-primary" />;
      case "meeting":
        return <Calendar className="h-4 w-4 text-info" />;
      case "growth":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "cofounder":
        return <Users className="h-4 w-4 text-accent" />;
      case "download":
        return <Download className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {getIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(event.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
