export type Score = { emoji: string; tip: string } | null;

export type LogEntry = {
  who: "👧" | "🤖";
  text: string; // English (bot) or transcript (user)
  translated?: string; // Non-English rendering (if lang !== 'en')
  score?: Score;
};

export const scenarios = [
  { id: "free", label: "👩‍🏫 Tutor" },
  { id: "school", label: "🏫 School" },
  { id: "store", label: "🛒 Store" },
  { id: "home", label: "🏠 Home" },
] as const;

export const languages = [
  { id: "en", label: "English" },
  { id: "hi", label: "Hindi" },
  { id: "mr", label: "Marathi" },
  { id: "gu", label: "Gujarati" },
  { id: "ta", label: "Tamil" },
] as const;

export type LangId = (typeof languages)[number]["id"];
export type ScenarioId = (typeof scenarios)[number]["id"];
