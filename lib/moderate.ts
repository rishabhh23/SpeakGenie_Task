const OPENAI_API = "https://api.openai.com/v1";

export async function moderate(text: string): Promise<boolean> {
  if (!text) return false;
  const r = await fetch(`${OPENAI_API}/moderations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
  });
  if (!r.ok) return false;
  const data = await r.json();
  return Boolean(data?.results?.[0]?.flagged);
}
