import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rule-based risk scoring
function calculateRiskScore(data: {
  idea: string;
  target_users: string;
  problem: string;
  revenue_model: string;
  stage: string;
  description: string;
}): { score: number; factors: Record<string, string>; reasons: string[] } {
  let riskScore = 0;
  const reasons: string[] = [];
  const factors: Record<string, string> = {
    market: "low",
    money: "low",
    team: "low",
    timing: "low",
    competition: "low",
  };

  // Empty or weak revenue model
  if (!data.revenue_model || data.revenue_model.trim().length < 10) {
    riskScore += 20;
    reasons.push("No clear revenue model defined");
    factors.money = "high";
  } else if (data.revenue_model.length < 30) {
    riskScore += 10;
    reasons.push("Revenue model needs more detail");
    factors.money = "medium";
  }

  // No target users
  if (!data.target_users || data.target_users.trim().length < 5) {
    riskScore += 25;
    reasons.push("No clear target user segment defined");
    factors.market = "high";
  } else if (data.target_users.length < 20) {
    riskScore += 10;
    reasons.push("Target user segment too broad");
    factors.market = "medium";
  }

  // Check problem statement
  if (!data.problem || data.problem.trim().length < 10) {
    riskScore += 15;
    reasons.push("Problem statement unclear");
    factors.market = factors.market === "high" ? "high" : "medium";
  }

  // Stage-based risk
  const earlyStages = ["idea", "concept", "pre-seed", "early"];
  if (earlyStages.some(s => data.stage?.toLowerCase().includes(s))) {
    riskScore += 10;
    reasons.push("Early stage increases execution risk");
    factors.team = "medium";
  }

  // Competition keywords
  const competitiveKeywords = ["uber", "airbnb", "amazon", "google", "facebook", "meta", "microsoft", "apple", "saas", "marketplace", "platform", "ai", "social"];
  const ideaLower = (data.idea + " " + data.description).toLowerCase();
  const competitiveMatches = competitiveKeywords.filter(k => ideaLower.includes(k));
  if (competitiveMatches.length >= 3) {
    riskScore += 15;
    reasons.push("Operating in highly competitive space");
    factors.competition = "high";
  } else if (competitiveMatches.length >= 1) {
    riskScore += 8;
    factors.competition = "medium";
  }

  // Timing risk based on buzzwords
  const hypeWords = ["metaverse", "web3", "crypto", "blockchain", "nft", "defi"];
  if (hypeWords.some(w => ideaLower.includes(w))) {
    riskScore += 10;
    reasons.push("Market timing uncertainty for emerging tech");
    factors.timing = "medium";
  }

  // Cap risk score at 100
  riskScore = Math.min(100, Math.max(0, riskScore));

  return { score: riskScore, factors, reasons };
}

// Generate fix suggestions based on risk factors
function generateFixSuggestions(factors: Record<string, string>, reasons: string[]): string[] {
  const suggestions: string[] = [];

  if (factors.market === "high" || factors.market === "medium") {
    suggestions.push("Narrow down your target user segment with specific demographics");
    suggestions.push("Conduct customer interviews to validate problem-solution fit");
  }

  if (factors.money === "high" || factors.money === "medium") {
    suggestions.push("Define a clear pricing strategy and revenue streams");
    suggestions.push("Consider simpler monetization before complex models");
  }

  if (factors.team === "high" || factors.team === "medium") {
    suggestions.push("Identify key skill gaps and consider co-founders or advisors");
    suggestions.push("Build a minimum viable team before scaling");
  }

  if (factors.competition === "high") {
    suggestions.push("Focus on a specific niche to differentiate from competitors");
    suggestions.push("Identify your unique value proposition clearly");
  }

  if (factors.timing === "medium" || factors.timing === "high") {
    suggestions.push("Validate market readiness before heavy investment");
    suggestions.push("Consider a phased approach to market entry");
  }

  if (suggestions.length === 0) {
    suggestions.push("Continue validating with potential customers");
    suggestions.push("Build a simple MVP to test core assumptions");
  }

  return suggestions.slice(0, 5);
}

// Generate MVP plan
function generateMvpPlan(data: { idea: string; stage: string }): {
  features: string[];
  tech_stack: string[];
  cost_estimate: string;
  "14_day_plan": string[];
} {
  return {
    features: ["User Authentication", "Core Value Feature", "Basic Dashboard", "Feedback Collection"],
    tech_stack: ["React", "TypeScript", "Supabase", "Tailwind CSS"],
    cost_estimate: "$200-500",
    "14_day_plan": [
      "Day 1-2: Validate idea with 10 potential users",
      "Day 3-4: Define core MVP features",
      "Day 5-9: Build MVP prototype",
      "Day 10-12: User testing and iteration",
      "Day 13-14: Launch soft release",
    ],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      title, 
      description, 
      industry, 
      founderSkills,
      // New fields for risk analysis
      idea,
      target_users,
      problem,
      revenue_model,
      stage
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from auth header if present
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Use the new fields if provided, otherwise fall back to legacy fields
    const ideaText = idea || title || "";
    const descriptionText = description || problem || "";
    const stageText = stage || "early";

    console.log(`Analyzing startup idea: ${ideaText} in ${industry || "General"}`);

    // Calculate rule-based risk score
    const riskAnalysis = calculateRiskScore({
      idea: ideaText,
      target_users: target_users || "",
      problem: problem || descriptionText,
      revenue_model: revenue_model || "",
      stage: stageText,
      description: descriptionText,
    });

    const fixSuggestions = generateFixSuggestions(riskAnalysis.factors, riskAnalysis.reasons);
    const mvpPlan = generateMvpPlan({ idea: ideaText, stage: stageText });

    // AI analysis for comprehensive evaluation
    const systemPrompt = `You are an expert startup analyst and business strategist. Analyze the given startup idea and provide a comprehensive evaluation with multiple perspectives.

Your response MUST be a valid JSON object with this exact structure:
{
  "swot": {
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
    "threats": ["threat1", "threat2", "threat3"]
  },
  "scores": {
    "feasibility": <number 0-100>,
    "innovation": <number 0-100>,
    "marketPotential": <number 0-100>
  },
  "recommendation": "<2-3 sentences with actionable advice>",
  "secondOpinion": {
    "optimistic": "<1-2 sentences from an optimistic perspective highlighting the best-case scenario>",
    "pessimistic": "<1-2 sentences from a pessimistic perspective highlighting key concerns>",
    "neutral": "<1-2 sentences from a balanced perspective with practical considerations>"
  },
  "founderReadiness": {
    "score": <number 0-100>,
    "skillGaps": ["gap1", "gap2"],
    "recommendation": "<1-2 sentences about team readiness>"
  },
  "redFlags": [
    {
      "type": "<Legal|Market|Technical|Financial|Operational>",
      "title": "<Short title>",
      "description": "<Brief explanation of the risk>"
    }
  ],
  "failurePrevention": {
    "similarFailures": ["<failed startup 1 and reason>", "<failed startup 2 and reason>"],
    "avoidanceStrategy": "<How to avoid similar failures>"
  },
  "thinkingProcess": [
    { "step": 1, "action": "Market size analysis", "finding": "<brief finding>" },
    { "step": 2, "action": "Competition evaluation", "finding": "<brief finding>" },
    { "step": 3, "action": "Technical feasibility check", "finding": "<brief finding>" },
    { "step": 4, "action": "Founder skill matching", "finding": "<brief finding>" },
    { "step": 5, "action": "Risk assessment", "finding": "<brief finding>" }
  ]
}

Scoring guidelines:
- Feasibility (0-100): Technical and operational feasibility
- Innovation (0-100): How novel and differentiated is the idea
- Market Potential (0-100): Size of addressable market
- Founder Readiness (0-100): Based on provided skills vs requirements

Red flag categories:
- Legal: Regulatory compliance, IP issues
- Market: Saturation, timing, demand
- Technical: Complexity, dependencies
- Financial: Revenue model, funding needs
- Operational: Execution challenges

Be specific, actionable, and realistic in your analysis. Reference real failed startups when applicable.`;

    const founderContext = founderSkills 
      ? `\n\nFounder Skills: ${founderSkills}` 
      : "\n\nFounder Skills: Not provided (assume general business background)";

    const userMessage = `Analyze this startup idea:

Title/Idea: ${ideaText}
Industry: ${industry || "General"}
Description: ${descriptionText}
${target_users ? `Target Users: ${target_users}` : ""}
${revenue_model ? `Revenue Model: ${revenue_model}` : ""}
${stage ? `Stage: ${stage}` : ""}${founderContext}

Provide your comprehensive analysis as a JSON object.`;

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
          { role: "user", content: userMessage },
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
    
    console.log("Raw AI response received");

    // Parse JSON from the response
    let analysisResult;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Provide a fallback response
      analysisResult = {
        swot: {
          strengths: ["Strong concept with clear value proposition"],
          weaknesses: ["Requires further market validation"],
          opportunities: ["Growing market demand in this sector"],
          threats: ["Competition from established players"],
        },
        scores: {
          feasibility: 70,
          innovation: 75,
          marketPotential: 72,
        },
        recommendation: "This idea shows promise but requires additional market research and competitive analysis before proceeding to the next stage.",
        secondOpinion: {
          optimistic: "Strong market potential with clear differentiation opportunity in a growing sector.",
          pessimistic: "High competition and uncertain customer acquisition costs may limit scalability.",
          neutral: "Viable idea that needs focused niche targeting and clear go-to-market strategy."
        },
        founderReadiness: {
          score: 65,
          skillGaps: ["Technical expertise", "Industry connections"],
          recommendation: "Consider adding a technical co-founder or advisor with industry experience."
        },
        redFlags: [
          {
            type: "Market",
            title: "Competition Risk",
            description: "Several established players exist in this space."
          }
        ],
        failurePrevention: {
          similarFailures: ["Similar startups failed due to poor market timing", "Others struggled with customer acquisition costs"],
          avoidanceStrategy: "Focus on validated niche markets and maintain lean operations in early stages."
        },
        thinkingProcess: [
          { step: 1, action: "Market size analysis", finding: "Growing market with moderate competition" },
          { step: 2, action: "Competition evaluation", finding: "Multiple competitors with varying approaches" },
          { step: 3, action: "Technical feasibility check", finding: "Achievable with standard technologies" },
          { step: 4, action: "Founder skill matching", finding: "Some skill gaps identified" },
          { step: 5, action: "Risk assessment", finding: "Moderate risks, manageable with strategy" }
        ]
      };
    }

    // Merge rule-based analysis with AI analysis
    const finalResult = {
      ...analysisResult,
      // Risk analysis results (rule-based)
      risk_score: riskAnalysis.score,
      risk_factors: riskAnalysis.factors,
      failure_reasons: riskAnalysis.reasons.length > 0 ? riskAnalysis.reasons : ["No major failure indicators detected"],
      fix_suggestions: fixSuggestions,
      mvp_plan: mvpPlan,
    };

    console.log("Analysis complete with risk score:", riskAnalysis.score);

    // Store in database if user is authenticated
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from("startup_ideas").insert({
          user_id: userId,
          title: ideaText,
          description: descriptionText,
          industry: industry || "General",
          feasibility_score: analysisResult.scores?.feasibility || 70,
          innovation_score: analysisResult.scores?.innovation || 70,
          market_potential_score: analysisResult.scores?.marketPotential || 70,
          recommendation: analysisResult.recommendation || "",
          swot: analysisResult.swot,
        });
        console.log("Idea saved to database for user:", userId);
      } catch (dbError) {
        console.error("Failed to save to database:", dbError);
        // Don't fail the request if DB save fails
      }
    }

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-idea function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
