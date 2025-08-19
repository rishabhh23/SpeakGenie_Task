export const runtime = "edge";

const OPENAI_API = "https://api.openai.com/v1";

// UI language -> Whisper lang code + script hints
const STT_LANG: Record<
  string,
  { code: string; prompt?: string; arabicScriptRegex?: RegExp }
> = {
  en: { code: "en" },
  hi: {
    code: "hi",
    prompt:
      "Transcribe in Hindi using Devanagari script only (हिन्दी). Do not use Urdu/Arabic script.",
    arabicScriptRegex: /[\u0600-\u06FF]/,
  },
  mr: { code: "mr" }, // Marathi (Devanagari)
  gu: { code: "gu" }, // Gujarati
  ta: { code: "ta" }, // Tamil
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    const uiLang = String(form.get("lang") || "en");
    const cfg = STT_LANG[uiLang] ?? STT_LANG.en;

    if (!(audio instanceof File)) {
      return new Response(JSON.stringify({ error: "No audio file" }), {
        status: 400,
      });
    }

    const openaiForm = new FormData();
    openaiForm.append("file", audio, "audio.webm");
    openaiForm.append("model", "whisper-1");
    openaiForm.append("response_format", "json");
    openaiForm.append("temperature", "0");
    openaiForm.append("task", "transcribe"); // do NOT auto-translate
    openaiForm.append("language", cfg.code); // force language
    if (cfg.prompt) openaiForm.append("prompt", cfg.prompt);

    const r = await fetch(`${OPENAI_API}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: openaiForm,
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(
        JSON.stringify({ error: "STT failed", details: err }),
        {
          status: 500,
        }
      );
    }

    const data = await r.json();
    let text: string = data.text ?? "";

    if (uiLang === "hi" && STT_LANG.hi.arabicScriptRegex!.test(text)) {
      const fix = await fetch(`${OPENAI_API}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "Convert this Urdu/Arabic-script Hindi text to standard Hindi in Devanagari script only. Output the converted text only.",
            },
            { role: "user", content: text },
          ],
        }),
      });
      const fixJson = await fix.json();
      text = fixJson.choices?.[0]?.message?.content?.trim() || text;
    }

    return Response.json({ text });
  } catch (e) {
    return new Response(JSON.stringify({ error: "STT exception" }), {
      status: 500,
    });
  }
}
