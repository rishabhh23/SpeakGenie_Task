"use client";

type Props = {
  recording: boolean;
  onToggle: () => void;
};

export default function Controls({ recording, onToggle }: Props) {
  return (
    <div className="card">
      <p className="hint">
        Press speak, say: <i>&quot; Hi Genie, what is a noun? &quot;</i>
      </p>
      <button
        onClick={onToggle}
        className={`btn ${recording ? "" : "btn-primary"} text-base`}
      >
        {recording ? "⏹️ Stop" : "🎙️ Speak"}
      </button>
    </div>
  );
}
