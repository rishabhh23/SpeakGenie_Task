// app/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";

type Score = { emoji: string; tip: string } | null;

type LogEntry = {
  who: "👧" | "🤖";
  text: string; // English (for bot) or transcript (for user)
  translated?: string; // Non-English rendering (shown if lang !== 'en')
  score?: Score;
};

const scenarios = [
  { id: "free", label: "👩‍🏫 Tutor" },
  { id: "school", label: "🏫 School" },
  { id: "store", label: "🛒 Store" },
  { id: "home", label: "🏠 Home" },
];

const languages = [
  { id: "en", label: "English" },
  { id: "hi", label: "Hindi" },
  { id: "mr", label: "Marathi" },
  { id: "gu", label: "Gujarati" },
  { id: "ta", label: "Tamil" },
];

export default function Page() {
  const [mode, setMode] = useState("free");
  const [lang, setLang] = useState("en");
  const [recording, setRecording] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom (latest message) whenever log changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [log]);

  useEffect(
    () => () => {
      mediaRecorderRef.current?.stop();
    },
    []
  );

  // Append newest (ChatGPT-style)
  function pushLog(e: LogEntry) {
    setLog((prev) => [...prev, e]);
  }

  function scoreReply(user: string, bot: string): Score {
    if (!user || user.trim().length < 3)
      return { emoji: "🙂", tip: "Try longer sentences." };
    if (bot.includes("?"))
      return {
        emoji: "👍",
        tip: "Great! Answer the question in a full sentence.",
      };
    return { emoji: "🤔", tip: "Add details: who/what/where." };
  }

  async function toggleRecord() {
    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const fd = new FormData();
          fd.append("audio", blob, "audio.webm");

          // 1) STT
          const sttRes = await fetch("/api/stt", { method: "POST", body: fd });
          const { text: userText } = await sttRes.json();
          pushLog({ who: "👧", text: userText || "[No speech detected]" });

          // 2) Chat
          const chatRes = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userText: userText || "Hi!",
              mode: mode === "free" ? undefined : mode,
            }),
          });
          const { text: reply } = await chatRes.json();

          // 3) Translation (only if non-English selected)
          let spoken = reply;
          let translated: string | undefined = undefined;
          if (lang !== "en") {
            const tRes = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: reply, targetLang: lang }),
            });
            const { text } = await tRes.json();
            spoken = text;
            translated = text;
          }

          // 4) TTS (speak the translated or original)
          const ttsRes = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: spoken, language: lang }),
          });
          const audioBuf = await ttsRes.arrayBuffer();
          const url = URL.createObjectURL(
            new Blob([audioBuf], { type: "audio/mpeg" })
          );
          new Audio(url).play();

          // 5) Log bot message (show both English + translated if present)
          pushLog({
            who: "🤖",
            text: reply,
            translated, // shown under English if lang !== 'en'
            score: scoreReply(userText, reply),
          });
        } catch {
          pushLog({
            who: "🤖",
            text: "Oops, something went wrong. Try again?",
          });
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } else {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  }

  return (
    <div className="container">
      <h1 className="text-4xl text-center font-semibold mb-2">
        Genie – Real-Time AI Voice English Tutor
      </h1>

      <div className="toolbar">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => setMode(s.id)}
            className={`btn ${mode === s.id ? "btn-primary" : ""}`}
          >
            {s.label}
          </button>
        ))}
        <div className="ml-auto">
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm overflow-y-auto h-[60vh]"
      >
        <div className="log">
          {log.map((m, i) => (
            <div key={i} className="card">
              <div className="row">
                <b>{m.who}</b>
                <div>
                  {m.text}
                  {m.translated && m.translated !== m.text && (
                    <div className="text-xl text-gray-600 italic mt-1">
                      {m.translated}
                    </div>
                  )}
                </div>
              </div>
              {m.score && (
                <div className="row">
                  <span className="badge">{m.score.emoji}</span>
                  <i className="hint">{m.score.tip}</i>
                </div>
              )}
            </div>
          ))}
          {log.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-8">
              Start a conversation — press <b>Speak</b> to begin.
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <p className="hint">
          Press speak, say: <i>&quot; Hi Genie, what is a noun? &quot;</i>
        </p>
        <button
          onClick={toggleRecord}
          className={`btn ${recording ? "" : "btn-primary"} text-base`}
        >
          {recording ? "⏹️ Stop" : "🎙️ Speak"}
        </button>
      </div>
    </div>
  );
}
