import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Twitter OAuth utilities
const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  return hmacSha1.update(signatureBaseString).digest("base64");
}

function generateOAuthHeader(method: string, fullUrl: string): string {
  // Parse URL to separate base URL and query params
  const urlObj = new URL(fullUrl);
  const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
  
  // Get query params
  const queryParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  // Include query params in signature calculation (required for GET requests with params)
  const allParams = { ...oauthParams, ...queryParams };
  const signature = generateOAuthSignature(method, baseUrl, allParams, API_SECRET!, ACCESS_TOKEN_SECRET!);

  const signedOAuthParams = { ...oauthParams, oauth_signature: signature };
  const entries = Object.entries(signedOAuthParams).sort((a, b) => a[0].localeCompare(b[0]));

  return "OAuth " + entries.map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`).join(", ");
}

async function getTwitterUser(username: string) {
  const url = `https://api.x.com/2/users/by/username/${username}?user.fields=profile_image_url,description,name`;
  const oauthHeader = generateOAuthHeader("GET", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: oauthHeader,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Twitter API error:", response.status, text);
    throw new Error(`Could not fetch user @${username}. They may not exist or have a private account.`);
  }

  const data = await response.json();
  if (data.errors || !data.data) {
    throw new Error(`User @${username} not found.`);
  }

  return data.data;
}

async function analyzeWithAI(user: { name: string; username: string; description: string; profile_image_url: string }) {
  const prompt = `You are a fun, comedic AI that makes humorous "baldness predictions" based on X (Twitter) profiles. This is purely for entertainment.

Analyze this X profile and make a funny, lighthearted prediction:

**Name:** ${user.name}
**Username:** @${user.username}
**Bio:** ${user.description || "No bio"}
**Profile Image URL:** ${user.profile_image_url?.replace("_normal", "_400x400") || "No image"}

Based on the bio content, look for humorous "baldness indicators" like:
- Hustle culture / grindset mentions (stress = hair loss joke)
- Coffee addiction references
- Gym/fitness obsession
- Crypto/Web3 involvement
- Startup founder vibes
- Sleep deprivation mentions
- Age hints
- Stress-related content

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "currentStatus": "bald" | "not_bald" | "unclear",
  "currentStatusReason": "A funny 1-2 sentence explanation based on profile analysis",
  "futureChance": <number between 0-100>,
  "futureReason": "A humorous 1-2 sentence prediction based on lifestyle hints in bio",
  "timeframe": "next 5-7 years" or similar fun timeframe
}

Be playful and funny! This is entertainment only. Reference specific things from their bio if possible.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI Gateway error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI credits depleted. Please try again later.");
    }
    throw new Error("AI analysis failed. Please try again.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No AI response received.");
  }

  // Parse JSON from response (handle potential markdown wrapping)
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Could not parse AI prediction. Please try again.");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
      throw new Error("Twitter API credentials not configured.");
    }
    if (!LOVABLE_API_KEY) {
      throw new Error("AI API key not configured.");
    }

    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      throw new Error("Please provide a valid username.");
    }

    const cleanUsername = username.replace("@", "").trim();
    console.log(`Analyzing user: @${cleanUsername}`);

    // Fetch Twitter user data
    const user = await getTwitterUser(cleanUsername);
    console.log("Fetched user:", user.name);

    // Get AI prediction
    const prediction = await analyzeWithAI(user);
    console.log("AI prediction:", prediction);

    // Combine results
    const result = {
      username: user.username,
      displayName: user.name,
      profileImage: user.profile_image_url?.replace("_normal", "_400x400") || "",
      currentStatus: prediction.currentStatus,
      currentStatusReason: prediction.currentStatusReason,
      futureChance: Math.min(100, Math.max(0, prediction.futureChance)),
      futureReason: prediction.futureReason,
      timeframe: prediction.timeframe || "next 5-7 years",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in analyze-baldness:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
