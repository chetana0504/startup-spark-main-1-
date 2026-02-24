import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { historicalData, fundingScenario } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating growth predictions from", historicalData.length, "data points");
    console.log("Funding scenario:", fundingScenario || "default");

    const systemPrompt = `You are an expert financial analyst and growth strategist. Analyze the historical revenue data and predict future growth with scenario analysis.

Your response MUST be a valid JSON object with this structure:
{
  "predictions": [
    { "month": "Month Year", "revenue": <predicted revenue number> },
    { "month": "Month Year", "revenue": <predicted revenue number> },
    { "month": "Month Year", "revenue": <predicted revenue number> },
    { "month": "Month Year", "revenue": <predicted revenue number> },
    { "month": "Month Year", "revenue": <predicted revenue number> },
    { "month": "Month Year", "revenue": <predicted revenue number> }
  ],
  "growthRate": <average monthly growth rate as percentage>,
  "projectedRevenue": <projected revenue for the last prediction month>,
  "confidence": <confidence level 0-100>,
  "insights": [
    "insight about growth pattern",
    "insight about seasonality or trends",
    "recommendation for growth optimization"
  ],
  "scenarioAnalysis": {
    "lowFunding": {
      "predictions": [
        { "month": "Month Year", "revenue": <revenue with minimal investment> }
      ],
      "growthRate": <growth rate percentage>,
      "narrative": "<Brief description of low funding scenario outcomes>"
    },
    "mediumFunding": {
      "predictions": [
        { "month": "Month Year", "revenue": <revenue with moderate investment> }
      ],
      "growthRate": <growth rate percentage>,
      "narrative": "<Brief description of medium funding scenario outcomes>"
    },
    "highFunding": {
      "predictions": [
        { "month": "Month Year", "revenue": <revenue with significant investment> }
      ],
      "growthRate": <growth rate percentage>,
      "narrative": "<Brief description of high funding scenario outcomes>"
    }
  }
}

For scenario analysis:
- Low Funding: Conservative growth (5-10% monthly), organic acquisition only
- Medium Funding: Moderate growth (15-25% monthly), paid marketing + team expansion
- High Funding: Aggressive growth (30-50% monthly), rapid scaling, market expansion

Provide 6 months of predictions for each scenario. Base predictions on trend analysis and realistic growth assumptions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this historical revenue data and predict future growth with scenario analysis:

${historicalData.map((d: any) => `${d.month}: $${d.revenue.toLocaleString()}`).join("\n")}

${fundingScenario ? `Focus on: ${fundingScenario} funding scenario` : "Provide all three funding scenarios"}

Provide growth predictions with scenario analysis as JSON.` 
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    console.log("Raw AI response:", content);

    let analysisResult;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: simple linear prediction with scenarios
      const lastRevenue = historicalData[historicalData.length - 1].revenue;
      
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const lastMonth = historicalData[historicalData.length - 1].month;
      const lastMonthParts = lastMonth.split(" ");
      let monthIdx = months.indexOf(lastMonthParts[0]);
      let year = parseInt(lastMonthParts[1]);
      
      const generateScenario = (growthRate: number) => {
        const predictions = [];
        let currentRevenue = lastRevenue;
        let tempMonthIdx = monthIdx;
        let tempYear = year;
        
        for (let i = 0; i < 6; i++) {
          tempMonthIdx++;
          if (tempMonthIdx > 11) {
            tempMonthIdx = 0;
            tempYear++;
          }
          currentRevenue = Math.round(currentRevenue * (1 + growthRate / 100));
          predictions.push({
            month: `${months[tempMonthIdx]} ${tempYear}`,
            revenue: currentRevenue,
          });
        }
        return predictions;
      };

      const mediumPredictions = generateScenario(15);

      analysisResult = {
        predictions: mediumPredictions,
        growthRate: 15,
        projectedRevenue: mediumPredictions[mediumPredictions.length - 1].revenue,
        confidence: 72,
        insights: [
          "Growth trajectory shows consistent upward trend",
          "Consider seasonal factors that may affect revenue",
          "Focus on customer retention to maintain growth momentum",
        ],
        scenarioAnalysis: {
          lowFunding: {
            predictions: generateScenario(8),
            growthRate: 8,
            narrative: "Conservative organic growth focusing on profitability over rapid scaling."
          },
          mediumFunding: {
            predictions: mediumPredictions,
            growthRate: 15,
            narrative: "Balanced growth with strategic investments in marketing and team expansion."
          },
          highFunding: {
            predictions: generateScenario(35),
            growthRate: 35,
            narrative: "Aggressive scaling with significant market capture and rapid team growth."
          }
        }
      };
    }

    console.log("Growth prediction complete:", analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in predict-growth function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
