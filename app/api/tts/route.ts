export const runtime = "nodejs";

const ELEVEN_API = "https://api.elevenlabs.io/v1";

export async function POST(req: Request) {
  try {
    const { text, language = "en" } = await req.json();
    if (!text)
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400,
      });

    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // replace with a voice from your account

    const r = await fetch(`${ELEVEN_API}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVEN_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.7, style: 0.2 },
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(
        JSON.stringify({ error: "TTS failed", details: err }),
        { status: 500 }
      );
    }

    const buf = await r.arrayBuffer();
    return new Response(buf, { headers: { "Content-Type": "audio/mpeg" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "TTS exception" }), {
      status: 500,
    });
  }
}
