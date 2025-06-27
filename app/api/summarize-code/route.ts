import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SummarizeRequest {
  code: string;
  language?: string;
}

const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 1000 * 5; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return false;
  }

  const timePassed = now - record.timestamp;

  if (timePassed > RATE_WINDOW) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait for 5  minute before trying again." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as Partial<SummarizeRequest>;
    const code = body.code?.trim();
    const language = body.language?.trim() || "code";

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    if (code.length > 5000) {
      return NextResponse.json(
        { error: "Code exceeds 5000 characters limit" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are a concise technical assistant. Given the following ${language} code, explain only what it does in 2-3 lines. Do not explain syntax, do not add assumptions, and do not provide suggestions.

\`\`\`${language}
${code}
\`\`\`

Only respond with a short explanation of what the code does.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        {
          error: "Failed to generate summary",
          details: `API error: ${geminiResponse.status} ${geminiResponse.statusText}`
        },
        { status: 500 }
      );
    }

    const result = await geminiResponse.json();
    const summary = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!summary) {
      return NextResponse.json(
        {
          error: "No summary generated",
          details: "Unexpected response format from Gemini API"
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, summary },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" }
      }
    );
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json(
      {
        error: "Failed to summarize code",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


