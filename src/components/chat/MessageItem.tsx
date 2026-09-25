"use client";

import { formatBytes, type ChatMessage, type Source } from "@/lib/client/api";
import { AlertTriangle, BookOpen, Check, Copy, FileText, Image as ImageIcon, RefreshCw, Square } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "../Logo";
import { Markdown } from "../Markdown";

function Sources({ sources, streaming }: { sources: Source[]; streaming: boolean }) {
  if (!sources.length) return null;
  const cited = sources.filter((s) => s.cited);
  // While streaming we don't know yet which sources are used.
  const shown = streaming ? [] : cited.length ? cited : [];
  const related = streaming ? [] : sources.filter((s) => !s.cited);
  if (!shown.length && !related.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {shown.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-300/80">
            <BookOpen size={12} /> Sources — FrankTechSpace knowledge base
          </div>
          <div className="flex flex-wrap gap-1.5">
            {shown.map((s) => (
              <span
                key={s.documentId}
                title={s.source ?? undefined}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-brand/25 bg-cyan-brand/5 px-2 py-1 text-xs text-cyan-100"
              >
                {s.index && <span className="font-mono text-[10px] text-cyan-400">[{s.index}]</span>}
                {s.title}
                <span className="text-[10px] text-slate-500">· {s.category}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {related.length > 0 && (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer select-none hover:text-slate-300">
            {related.length} related knowledge article{related.length > 1 ? "s" : ""} (not cited)
          </summary>
          <ul className="mt-1 space-y-0.5 pl-4">
            {related.map((s) => (
              <li key={s.documentId}>
                {s.title} <span className="text-slate-600">· {s.category}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function MessageItem({
  message,
  streaming = false,
  canRegenerate = false,
  onRegenerate,
}: {
  message: ChatMessage;
  streaming?: boolean;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] space-y-2">
          {message.attachments?.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {message.attachments.map((a) => (
                <span key={a.id} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-2 py-1 text-xs text-slate-300">
                  {a.mimeType.startsWith("image/") ? <ImageIcon size={13} /> : <FileText size={13} />}
                  <span className="max-w-[180px] truncate">{a.name}</span>
                  <span className="text-slate-500">{formatBytes(a.size)}</span>
                </span>
              ))}
            </div>
          )}
          <div className="whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-blue-600/90 to-violet-600/80 px-4 py-2.5 text-[0.95rem] leading-relaxed text-white shadow-lg shadow-blue-900/20">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  const empty = streaming && !message.content;

  return (
    <div className="group flex gap-3">
      <div className="pt-0.5">
        <LogoMark size={30} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-200">FrankTechSpace AI</span>
          {message.model && !streaming && <span className="text-slate-600">{message.model}</span>}
        </div>
        {empty ? (
          <div className="flex items-center gap-1.5 py-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className="typing-dot h-2 w-2 rounded-full bg-cyan-400" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
            <span className="ml-2 text-xs text-slate-500">Searching knowledge base…</span>
          </div>
        ) : (
          <div className={`text-slate-200 ${streaming ? "cursor-blink" : ""}`}>
            <Markdown content={message.content} />
          </div>
        )}

        {message.status === "stopped" && !streaming && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
            <Square size={10} /> Generation stopped
          </div>
        )}
        {message.status === "error" && !streaming && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300">
            <AlertTriangle size={11} /> The response failed
          </div>
        )}

        <Sources sources={message.sources ?? []} streaming={streaming} />

        {!streaming && message.content && (
          <div className="mt-2 flex items-center gap-1 text-slate-500 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
            <button onClick={copy} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-ink-800 hover:text-slate-200">
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
            </button>
            {canRegenerate && (
              <button onClick={onRegenerate} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-ink-800 hover:text-slate-200">
                <RefreshCw size={13} /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
