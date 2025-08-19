export const runtime = "edge";

const OPENAI_API = "https://api.openai.com/v1";

const LANG_NAME: Record<string, string> = {
  en: "English",
  hi: "Hindi (Devanagari script)",
  mr: "Marathi (Devanagari script)",
  gu: "Gujarati (Gujarati script)",
  ta: "Tamil (Tamil script)",
};

function targetName(code: string) {
  return LANG_NAME[code] ?? code;
}

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();
    if (!text || !targetLang) {
      return new Response(JSON.stringify({ error: "Missing inputs" }), {
        status: 400,
      });
    }

    const r = await fetch(`${OPENAI_API}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.0,
        messages: [
          {
            role: "system",
            content: `You are a translation engine.
- Output ONLY the translation text, no quotes, no brackets, no explanations.
- Translate into the specified target language and script precisely.
- Do NOT transliterate. Use the native script of the target language.`,
          },
          {
            role: "user",
            content: `Target language: ${targetName(targetLang)}
Text: ${text}`,
          },
        ],
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(
        JSON.stringify({ error: "Translate failed", details: err }),
        { status: 500 }
      );
    }

    const data = await r.json();
    let out: string = data.choices?.[0]?.message?.content?.trim() ?? text;

    const isDevanagari = /[\u0900-\u097F]/.test(out);
    if (targetLang === "hi" && !isDevanagari) {
      const r2 = await fetch(`${OPENAI_API}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.0,
          messages: [
            {
              role: "system",
              content:
                "Translate to Hindi using Devanagari script only. Output translation text only.",
            },
            { role: "user", content: text },
          ],
        }),
      });
      const d2 = await r2.json();
      out = d2.choices?.[0]?.message?.content?.trim() ?? out;
    }

    return Response.json({ text: out });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Translate exception" }), {
      status: 500,
    });
  }
}
