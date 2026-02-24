import { cn } from "@/lib/utils";
import { Brain, CheckCircle2 } from "lucide-react";

interface ThinkingStep {
  step: number;
  action: string;
  finding: string;
}

interface ThinkingProcessCardProps {
  steps: ThinkingStep[];
}

export function ThinkingProcessCard({ steps }: ThinkingProcessCardProps) {
  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <span className="font-semibold text-foreground">How AI Analyzed Your Idea</span>
      </div>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.step} className="relative flex items-start gap-4 pl-0">
              {/* Step indicator */}
              <div className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                "bg-background border-primary text-primary"
              )}>
                <CheckCircle2 className="h-4 w-4" />
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Step {step.step}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{step.action}</p>
                <p className="text-sm text-muted-foreground">{step.finding}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
