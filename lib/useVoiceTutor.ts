"use client";
import { useEffect, useRef, useState } from "react";
import type { LangId, LogEntry, ScenarioId, Score } from "./types";

export function useVoiceTutor() {
  const [mode, setMode] = useState<ScenarioId>("free");
  const [lang, setLang] = useState<LangId>("en");
  const [recording, setRecording] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [log]);

  // Stop recorder on unmount
  useEffect(
    () => () => {
      mediaRecorderRef.current?.stop();
    },
    []
  );

  function pushLog(e: LogEntry) {
    setLog((prev) => [...prev, e]); // newest at bottom
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

          // 3) Translate (if needed)
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

          // 4) TTS
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

          // 5) Log bot line
          pushLog({
            who: "🤖",
            text: reply,
            translated,
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

  return {
    mode,
    setMode,
    lang,
    setLang,
    recording,
    toggleRecord,
    log,
    pushLog,
    scrollRef,
  };
}
