export const runtime = "edge";

const OPENAI_API = "https://api.openai.com/v1";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof File)) {
      return new Response(JSON.stringify({ error: "No audio file" }), {
        status: 400,
      });
    }

    const openaiForm = new FormData();
    openaiForm.append("file", audio, "audio.webm");
    openaiForm.append("model", "whisper-1");

    const r = await fetch(`${OPENAI_API}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: openaiForm,
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(
        JSON.stringify({ error: "STT failed", details: err }),
        { status: 500 }
      );
    }

    const data = await r.json();
    return Response.json({ text: data.text ?? "" });
  } catch (e) {
    return new Response(JSON.stringify({ error: "STT exception" }), {
      status: 500,
    });
  }
}
