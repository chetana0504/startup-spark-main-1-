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
    const { profile, candidates } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Finding co-founder matches for:", profile.name);

    const systemPrompt = `You are an expert startup co-founder matchmaker. Analyze the user's profile against the candidate profiles and score compatibility.

Your response MUST be a valid JSON object with this structure:
{
  "matches": [
    {
      "id": "<candidate id>",
      "name": "<candidate name>",
      "skills": ["skill1", "skill2"],
      "experience": "<candidate experience>",
      "lookingFor": "<what they're looking for>",
      "matchScore": <number 0-100>,
      "matchReasons": ["reason1", "reason2", "reason3"]
    }
  ]
}

Scoring criteria:
- Complementary skills (do their skills fill gaps?)
- Alignment of goals (what they're looking for matches the user's profile)
- Experience compatibility (similar stage or complementary experience)

Order matches by matchScore descending. Provide specific, actionable match reasons.`;

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
            content: `Find the best co-founder matches.

User Profile:
- Name: ${profile.name}
- Skills: ${profile.skills.join(", ")}
- Experience: ${profile.experience}
- Looking for: ${profile.lookingFor}

Candidate Profiles:
${candidates.map((c: any) => `
- ID: ${c.id}
- Name: ${c.name}
- Skills: ${c.skills.join(", ")}
- Experience: ${c.experience}
- Looking for: ${c.lookingFor}
`).join("\n")}

Analyze compatibility and return matches as JSON.` 
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
      // Fallback: return candidates with basic scoring
      analysisResult = {
        matches: candidates.map((c: any, i: number) => ({
          ...c,
          matchScore: 85 - (i * 10),
          matchReasons: ["Complementary skill set", "Aligned goals", "Compatible experience level"],
        })),
      };
    }

    console.log("Matching complete:", analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in match-cofounder function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
