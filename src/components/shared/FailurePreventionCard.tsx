import { Shield, AlertCircle, Lightbulb } from "lucide-react";

interface FailurePreventionProps {
  similarFailures: string[];
  avoidanceStrategy: string;
}

export function FailurePreventionCard({ similarFailures, avoidanceStrategy }: FailurePreventionProps) {
  return (
    <div className="space-y-4">
      {/* Similar Failures */}
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="font-semibold text-foreground">Similar Startup Failures</span>
        </div>
        <ul className="space-y-2">
          {similarFailures.map((failure, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
              {failure}
            </li>
          ))}
        </ul>
      </div>

      {/* Avoidance Strategy */}
      <div className="p-4 rounded-lg bg-success/10 border border-success/30">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-success" />
          <span className="font-semibold text-foreground">How to Avoid</span>
        </div>
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{avoidanceStrategy}</p>
        </div>
      </div>
    </div>
  );
}
