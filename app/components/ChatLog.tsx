"use client";
import { forwardRef } from "react";
import type { LogEntry } from "@/lib/types";

type Props = {
  log: LogEntry[];
};

const ChatLog = forwardRef<HTMLDivElement, Props>(function ChatLog(
  { log },
  ref
) {
  return (
    <div
      ref={ref}
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
  );
});

export default ChatLog;
