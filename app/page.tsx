"use client";
import { useVoiceTutor } from "@/lib/useVoiceTutor";
import Toolbar from "./components/Toolbar";
import ChatLog from "./components/ChatLog";
import Controls from "./components/Controls";
import Footer from "./components/Footer";

export default function Page() {
  const {
    mode,
    setMode,
    lang,
    setLang,
    recording,
    toggleRecord,
    log,
    scrollRef,
  } = useVoiceTutor();

  return (
    <>
      <div className="container">
        <h1 className="text-4xl text-center font-semibold mb-2">
          Genie – Real-Time AI Voice English Tutor
        </h1>

        <Toolbar mode={mode} setMode={setMode} lang={lang} setLang={setLang} />

        <ChatLog ref={scrollRef} log={log} />

        <Controls recording={recording} onToggle={toggleRecord} />
      </div>

      <Footer />
    </>
  );
}
