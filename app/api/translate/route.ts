import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { q, source, target } = body;

  console.log("[Translate API] Incoming request:", body);

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate only the following text from ${source} to ${target}, and respond with only the translated sentence:\n\n${q}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    if (data.error) {
      console.error("[Translate API] Gemini error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const translatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

    if (!translatedText) {
      return NextResponse.json(
        { error: "Translation failed: No content received" },
        { status: 500 }
      );
    }

    return NextResponse.json({ translatedText });
  } catch (err: any) {
    console.error("[Translate API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
