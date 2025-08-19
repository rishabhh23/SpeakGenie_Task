"use client";
import { scenarios, languages, LangId, ScenarioId } from "@/lib/types";

type Props = {
  mode: ScenarioId;
  setMode: (m: ScenarioId) => void;
  lang: LangId;
  setLang: (l: LangId) => void;
};

export default function Toolbar({ mode, setMode, lang, setLang }: Props) {
  return (
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
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as LangId)}
        >
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
