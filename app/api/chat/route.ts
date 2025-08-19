export const runtime = "edge";

import { tutorSystem, roleplayTemplates } from "@/lib/prompts";
import { moderate } from "@/lib/moderate";

const OPENAI_API = "https://api.openai.com/v1";

export async function POST(req: Request) {
  try {
    const { userText, mode } = await req.json();
    if (!userText)
      return new Response(JSON.stringify({ error: "Missing userText" }), {
        status: 400,
      });

    if (await moderate(userText)) {
      return Response.json({
        text: "Let's talk about something safe and fun instead! 😊",
      });
    }

    const system =
      mode && roleplayTemplates[mode]
        ? `${tutorSystem}\nCurrent scenario: ${roleplayTemplates[mode]}`
        : tutorSystem;

    const r = await fetch(`${OPENAI_API}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userText },
        ],
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(
        JSON.stringify({ error: "Chat failed", details: err }),
        { status: 500 }
      );
    }

    const data = await r.json();
    let reply: string =
      data.choices?.[0]?.message?.content ||
      "I'm here! Say something, and we’ll practice together.";

    if (await moderate(reply)) {
      reply =
        "Let's try a different topic! Tell me about your favorite food. 😄";
    }

    return Response.json({ text: reply });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Chat exception" }), {
      status: 500,
    });
  }
}
