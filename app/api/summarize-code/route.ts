import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface SummarizeRequest {
  code: string;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SummarizeRequest>;
    const { code, language } = body;

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // Optional: Limit code size to avoid API limits
    if (code.length > 5000) {
      return NextResponse.json(
        { error: "Code is too large to summarize. Limit to 5000 characters." },
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

    const lang = language?.trim() || "code";

    const prompt = `Please analyze and summarize the following ${lang}:

\`\`\`${lang}
${code}
\`\`\`

Provide a concise summary that includes:
1. What the code does
2. Key functions/classes
3. Main logic flow
4. Any important patterns or techniques used
5. Potential improvements or considerations

Keep the summary clear and informative for developers.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
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
    const summary = result?.candidates?.[0]?.content?.parts?.[0]?.text;

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
      {
        success: true,
        summary: summary.trim()
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Adjust as needed for CORS
        }
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
