"use client";

import { api, formatBytes } from "@/lib/client/api";
import { ArrowUp, FileText, Image as ImageIcon, Loader2, Paperclip, Square, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type PendingFile = {
  key: string;
  name: string;
  size: number;
  mimeType: string;
  id?: string;
  uploading: boolean;
  error?: string;
};

const ACCEPT = ".pdf,.docx,.txt,.md,.markdown,.csv,.html,.png,.jpg,.jpeg,.webp,.gif";

export function Composer({
  busy,
  onSend,
  onStop,
}: {
  busy: boolean;
  onSend: (text: string, attachmentIds: string[], names: { id: string; name: string; mimeType: string; size: number }[]) => void;
  onStop: () => void;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
  }, [text]);

  const uploading = files.some((f) => f.uploading);
  const ready = files.filter((f) => f.id && !f.error);
  const canSend = !busy && !uploading && (text.trim().length > 0 || ready.length > 0);

  const upload = async (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list).slice(0, 5 - files.length);
    for (const file of picked) {
      const key = `${file.name}-${Date.now()}-${Math.random()}`;
      setFiles((f) => [...f, { key, name: file.name, size: file.size, mimeType: file.type, uploading: true }]);
      const form = new FormData();
      form.append("file", file);
      try {
        const { file: saved } = await api<{ file: { id: string; mimeType: string } }>("/api/files/upload", {
          method: "POST",
          body: form,
        });
        setFiles((f) => f.map((x) => (x.key === key ? { ...x, id: saved.id, mimeType: saved.mimeType, uploading: false } : x)));
      } catch (e) {
        setFiles((f) => f.map((x) => (x.key === key ? { ...x, uploading: false, error: (e as Error).message } : x)));
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = () => {
    if (!canSend) return;
    onSend(
      text.trim(),
      ready.map((f) => f.id!),
      ready.map((f) => ({ id: f.id!, name: f.name, mimeType: f.mimeType, size: f.size })),
    );
    setText("");
    setFiles([]);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="rounded-2xl border border-ink-600 bg-ink-850/90 shadow-[0_0_0_1px_rgba(34,211,238,0.03),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur transition focus-within:border-cyan-brand/50 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.10),0_12px_40px_rgba(0,0,0,0.45)]">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {files.map((f) => (
              <div
                key={f.key}
                className={`flex max-w-[240px] items-center gap-2 rounded-lg border px-2 py-1.5 text-xs ${
                  f.error ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-ink-600 bg-ink-800 text-slate-300"
                }`}
                title={f.error}
              >
                {f.uploading ? (
                  <Loader2 size={14} className="animate-spin text-cyan-300" />
                ) : f.mimeType.startsWith("image/") ? (
                  <ImageIcon size={14} />
                ) : (
                  <FileText size={14} />
                )}
                <div className="min-w-0">
                  <div className="truncate">{f.name}</div>
                  <div className="text-[10px] text-slate-500">{f.error ? f.error : f.uploading ? "Reading file…" : formatBytes(f.size)}</div>
                </div>
                <button onClick={() => setFiles((x) => x.filter((y) => y.key !== f.key))} className="text-slate-500 hover:text-white" aria-label="Remove">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 p-2">
          <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => upload(e.target.files)} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={files.length >= 5}
            className="mb-0.5 rounded-xl p-2.5 text-slate-400 transition hover:bg-ink-700 hover:text-cyan-200 disabled:opacity-40"
            title="Attach PDF, DOCX, TXT or image"
          >
            <Paperclip size={19} />
          </button>
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder="Ask FrankTechSpace AI…"
            className="max-h-[220px] min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[0.95rem] text-white outline-none placeholder:text-slate-500"
          />
          {busy ? (
            <button
              onClick={onStop}
              className="mb-0.5 grid h-10 w-10 place-items-center rounded-xl bg-slate-200 text-ink-950 transition hover:bg-white"
              title="Stop generating"
            >
              <Square size={15} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!canSend}
              className="brand-gradient mb-0.5 grid h-10 w-10 place-items-center rounded-xl text-ink-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              title="Send"
            >
              <ArrowUp size={19} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        FrankTechSpace AI can make mistakes. Verify important information — especially government procedures and fees.
      </p>
    </div>
  );
}
