import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";

interface DataPoint {
  month: string;
  revenue: number;
}

interface ScenarioData {
  predictions: DataPoint[];
  growthRate: number;
  narrative: string;
}

interface ScenarioChartProps {
  historicalData: DataPoint[];
  lowFunding: ScenarioData;
  mediumFunding: ScenarioData;
  highFunding: ScenarioData;
  activeScenario: "low" | "medium" | "high" | "all";
}

export function ScenarioChart({
  historicalData,
  lowFunding,
  mediumFunding,
  highFunding,
  activeScenario,
}: ScenarioChartProps) {
  // Combine data for chart
  const chartData = historicalData.map((d, i) => ({
    month: d.month,
    actual: d.revenue,
    low: null,
    medium: null,
    high: null,
  }));

  // Add predictions
  const maxLength = Math.max(
    lowFunding.predictions.length,
    mediumFunding.predictions.length,
    highFunding.predictions.length
  );

  for (let i = 0; i < maxLength; i++) {
    chartData.push({
      month: lowFunding.predictions[i]?.month || mediumFunding.predictions[i]?.month || highFunding.predictions[i]?.month,
      actual: null as any,
      low: lowFunding.predictions[i]?.revenue || null,
      medium: mediumFunding.predictions[i]?.revenue || null,
      high: highFunding.predictions[i]?.revenue || null,
    });
  }

  const scenarios = [
    {
      key: "low",
      label: "Low Funding",
      data: lowFunding,
      color: "hsl(var(--warning))",
      bgClass: "bg-warning/10",
      borderClass: "border-warning/30",
      textClass: "text-warning",
    },
    {
      key: "medium",
      label: "Medium Funding",
      data: mediumFunding,
      color: "hsl(var(--primary))",
      bgClass: "bg-primary/10",
      borderClass: "border-primary/30",
      textClass: "text-primary",
    },
    {
      key: "high",
      label: "High Funding",
      data: highFunding,
      color: "hsl(var(--success))",
      bgClass: "bg-success/10",
      borderClass: "border-success/30",
      textClass: "text-success",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000)}K`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number, name: string) => {
                if (value === null) return [null, null];
                const label = name === "actual" ? "Actual" : 
                  name === "low" ? "Low Funding" :
                  name === "medium" ? "Medium Funding" : "High Funding";
                return [`$${value?.toLocaleString()}`, label];
              }}
            />
            <Legend />
            
            {/* Actual line */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="hsl(var(--foreground))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--foreground))", strokeWidth: 2, r: 3 }}
              name="Actual"
            />
            
            {/* Scenario lines */}
            {(activeScenario === "all" || activeScenario === "low") && (
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="hsl(var(--warning))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Low Funding"
              />
            )}
            {(activeScenario === "all" || activeScenario === "medium") && (
              <Line 
                type="monotone" 
                dataKey="medium" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Medium Funding"
              />
            )}
            {(activeScenario === "all" || activeScenario === "high") && (
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="High Funding"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-3 gap-3">
        {scenarios.map((scenario) => (
          <div
            key={scenario.key}
            className={cn(
              "p-3 rounded-lg border transition-all",
              scenario.bgClass,
              scenario.borderClass,
              activeScenario === scenario.key && "ring-2 ring-offset-2 ring-offset-background",
              activeScenario === scenario.key && scenario.key === "low" && "ring-warning",
              activeScenario === scenario.key && scenario.key === "medium" && "ring-primary",
              activeScenario === scenario.key && scenario.key === "high" && "ring-success"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={cn("h-4 w-4", scenario.textClass)} />
              <span className="text-xs font-semibold text-foreground">{scenario.label}</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className={cn("h-3 w-3", scenario.textClass)} />
              <span className={cn("text-lg font-bold font-display", scenario.textClass)}>
                +{scenario.data.growthRate}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {scenario.data.narrative}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
