import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Minus, Zap } from "lucide-react";

interface ComparisonItem {
  feature: string;
  traditional: string | boolean;
  aiPowered: string | boolean;
}

const comparisonData: ComparisonItem[] = [
  {
    feature: "Idea Analysis Speed",
    traditional: "Days to weeks",
    aiPowered: "Seconds",
  },
  {
    feature: "SWOT Analysis",
    traditional: "Manual research required",
    aiPowered: "Automated & comprehensive",
  },
  {
    feature: "Market Research",
    traditional: "Expensive consultants",
    aiPowered: "Instant AI insights",
  },
  {
    feature: "Meeting Summarization",
    traditional: "Manual note-taking",
    aiPowered: "Auto-generated summaries",
  },
  {
    feature: "Co-Founder Matching",
    traditional: "Networking events only",
    aiPowered: "AI skill-based matching",
  },
  {
    feature: "Growth Prediction",
    traditional: "Basic spreadsheets",
    aiPowered: "ML-powered forecasting",
  },
  {
    feature: "Cost",
    traditional: "$1000s+",
    aiPowered: "Affordable subscription",
  },
  {
    feature: "24/7 Availability",
    traditional: false,
    aiPowered: true,
  },
  {
    feature: "Bias-Free Analysis",
    traditional: false,
    aiPowered: true,
  },
];

function renderValue(value: string | boolean) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
    ) : (
      <XCircle className="h-5 w-5 text-destructive mx-auto" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

export function ComparisonTable() {
  return (
    <Card variant="glass" className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Traditional Tools vs AI-Powered Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Feature</TableHead>
              <TableHead className="text-center">Traditional</TableHead>
              <TableHead className="text-center bg-primary/5">AI-Powered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonData.map((item) => (
              <TableRow key={item.feature}>
                <TableCell className="font-medium">{item.feature}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {renderValue(item.traditional)}
                </TableCell>
                <TableCell className="text-center bg-primary/5 text-foreground">
                  {renderValue(item.aiPowered)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
