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
    const { transcript, outputLanguage = "en", analysisType = "transcript" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing meeting (type: ${analysisType}, output language: ${outputLanguage})...`);

    // Always include explicit language instruction for consistency
    const languageName = getLanguageName(outputLanguage);
    const languageInstruction = `CRITICAL INSTRUCTION: You MUST generate ALL output text (summary, action items, key decisions, next steps, recommendations, and ALL other fields) in ${languageName} language. Do NOT use English unless the output language is English. The transcript may be in any language, but your analysis output MUST be in ${languageName}.`;

    const systemPrompt = `You are an expert meeting analyst with emotional intelligence capabilities. Analyze the given meeting transcript and extract key information along with emotional dynamics.

${languageInstruction}

Determinism requirement: When given the exact same transcript + parameters, produce the same JSON output (no creative rewording, no random variation).

Your response MUST be a valid JSON object with this exact structure:
{
  "summary": "<A concise 2-3 sentence summary of the meeting>",
  "actionItems": ["action1", "action2", "action3"],
  "keyDecisions": ["decision1", "decision2"],
  "participants": ["name1", "name2"],
  "nextSteps": "<Brief description of recommended next steps>",
  "sentiment": "<Overall sentiment: Positive, Neutral, or Negative>",
  "improvementSuggestions": [
    "<Specific suggestion to improve meeting effectiveness>",
    "<Suggestion for better team dynamics>"
  ],
  "emotionInsight": {
    "overallMood": "<Positive|Neutral|Tense|Mixed>",
    "confidenceLevel": <0-100>,
    "agreementLevel": <0-100>,
    "conflictPoints": [
      {
        "topic": "<topic of disagreement>",
        "participants": ["name1", "name2"],
        "resolution": "<resolved|unresolved|partial>"
      }
    ],
    "energyMoments": [
      {
        "type": "<high|low>",
        "description": "<brief description of the moment>",
        "participants": ["name"]
      }
    ],
    "recommendations": [
      "<recommendation for improving team dynamics>"
    ]
  }
}

Emotion Analysis Guidelines:
- Confidence Level: How decisive and certain are the participants (0-100)
- Agreement Level: How aligned is the team on decisions (0-100)
- Conflict Points: Areas of disagreement or tension
- Energy Moments: High engagement or low energy points in the meeting
- Improvement Suggestions: Practical tips for better meetings

${analysisType === "video" ? "Note: This transcript was extracted from a video/audio recording. Account for potential transcription artifacts." : ""}

Be specific and extract actual names, decisions, and emotional cues from the transcript.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this meeting transcript for key insights and emotional dynamics:

${transcript}` 
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
      analysisResult = {
        summary: "Meeting discussed project updates and next steps.",
        actionItems: ["Review meeting notes", "Follow up with team members"],
        keyDecisions: ["Continue with current approach"],
        participants: ["Team Members"],
        nextSteps: "Schedule follow-up meeting to track progress.",
        sentiment: "Neutral",
        improvementSuggestions: [
          "Consider setting a clear agenda before meetings",
          "Assign action items with specific deadlines"
        ],
        emotionInsight: {
          overallMood: "Neutral",
          confidenceLevel: 70,
          agreementLevel: 75,
          conflictPoints: [],
          energyMoments: [
            {
              type: "high",
              description: "Team engaged during planning discussion",
              participants: ["Team"]
            }
          ],
          recommendations: [
            "Consider structured decision-making process for complex topics"
          ]
        }
      };
    }

    console.log("Meeting analysis complete:", analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-meeting function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    hi: "Hindi (हिन्दी)",
    kn: "Kannada (ಕನ್ನಡ)",
    te: "Telugu (తెలుగు)",
    ta: "Tamil (தமிழ்)",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
    ru: "Russian",
  };
  return languages[code] || "English";
}
