"use client";

import { api } from "@/lib/client/api";
import { CheckCircle2, Loader2, RotateCcw, Save, XCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type Settings = {
  systemPrompt: string;
  provider: "openai" | "ollama" | "none";
  baseUrl: string;
  model: string;
  embeddingModel: string;
  temperature: number;
  hasApiKey: boolean;
  apiKeyPreview: string | null;
  defaultSystemPrompt: string;
};

type ToolInfo = { name: string; description: string };

const input =
  "w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-brand/60";

const PRESETS: Record<string, { baseUrl: string; model: string }> = {
  openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  ollama: { baseUrl: "http://127.0.0.1:11434", model: "llama3.1" },
};

export function SettingsPanel() {
  const [s, setS] = useState<Settings | null>(null);
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [test, setTest] = useState<{ ok: boolean; reply?: string; error?: string; ms?: number; embedding?: string | null } | null>(null);

  useEffect(() => {
    api<{ settings: Settings; tools: ToolInfo[] }>("/api/settings")
      .then((d) => {
        setS(d.settings);
        setTools(d.tools);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (!s) {
    return error ? <p className="text-sm text-red-300">{error}</p> : <Loader2 className="animate-spin text-slate-500" />;
  }

  const save = async (extra: Record<string, unknown> = {}) => {
    setBusy("save");
    setError(null);
    try {
      const { settings } = await api<{ settings: Settings }>("/api/settings", {
        method: "PUT",
        body: JSON.stringify({ ...s, apiKey: apiKey || undefined, ...extra }),
      });
      setS(settings);
      setApiKey("");
      setNotice("Settings saved. New messages use the updated configuration.");
      setTimeout(() => setNotice(null), 3500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const runTest = async () => {
    setBusy("test");
    setTest(null);
    try {
      setTest(await api("/api/settings/test", { method: "POST" }));
    } catch (e) {
      setTest({ ok: false, error: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{notice}</div>}

      <section className="rounded-xl border border-ink-700 bg-ink-900/60 p-5">
        <h3 className="text-sm font-semibold text-white">AI model provider</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Any OpenAI-compatible API (OpenAI, Groq, OpenRouter, LM Studio, Ollama /v1…) or native Ollama. Environment variables
          (AI_PROVIDER, AI_BASE_URL, AI_API_KEY, AI_MODEL) provide defaults; values saved here override them.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs text-slate-400">Provider</span>
            <select
              className={input}
              value={s.provider}
              onChange={(e) => {
                const provider = e.target.value as Settings["provider"];
                const preset = PRESETS[provider];
                setS({ ...s, provider, ...(preset && s.provider !== provider ? preset : {}) });
              }}
            >
              <option value="openai">OpenAI-compatible API</option>
              <option value="ollama">Ollama (native)</option>
              <option value="none">None (knowledge-base only)</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs text-slate-400">Model</span>
            <input className={input} value={s.model} onChange={(e) => setS({ ...s, model: e.target.value })} disabled={s.provider === "none"} />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs text-slate-400">Base URL</span>
            <input className={input} value={s.baseUrl} onChange={(e) => setS({ ...s, baseUrl: e.target.value })} disabled={s.provider === "none"} />
          </label>
          {s.provider === "openai" && (
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs text-slate-400">
                API key {s.hasApiKey && <span className="text-emerald-400">· saved ({s.apiKeyPreview})</span>}
              </span>
              <div className="flex gap-2">
                <input
                  className={input}
                  type="password"
                  placeholder={s.hasApiKey ? "Leave blank to keep the current key" : "sk-…"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  autoComplete="off"
                />
                {s.hasApiKey && (
                  <button onClick={() => save({ clearApiKey: true })} className="shrink-0 rounded-lg border border-ink-600 px-3 text-xs text-slate-300 hover:bg-ink-800">
                    Remove
                  </button>
                )}
              </div>
            </label>
          )}
          <label>
            <span className="mb-1 block text-xs text-slate-400">Embedding model (optional, enables semantic search)</span>
            <input
              className={input}
              value={s.embeddingModel}
              placeholder={s.provider === "ollama" ? "e.g. nomic-embed-text" : "e.g. text-embedding-3-small"}
              onChange={(e) => setS({ ...s, embeddingModel: e.target.value })}
              disabled={s.provider === "none"}
            />
          </label>
          <label>
            <span className="mb-1 block text-xs text-slate-400">Temperature ({s.temperature})</span>
            <input type="range" min={0} max={1.2} step={0.1} value={s.temperature} onChange={(e) => setS({ ...s, temperature: Number(e.target.value) })} className="mt-2 w-full accent-cyan-400" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={() => save()} disabled={busy === "save"} className="brand-gradient flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-60">
            {busy === "save" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
          <button onClick={runTest} disabled={busy === "test"} className="flex items-center gap-1.5 rounded-lg border border-ink-600 px-4 py-2 text-sm text-slate-200 hover:bg-ink-800">
            {busy === "test" ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />} Test saved connection
          </button>
          {s.embeddingModel && <span className="text-xs text-slate-500">After changing the embedding model, re-index the knowledge base.</span>}
        </div>
        {test && (
          <div className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${test.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-red-500/30 bg-red-500/10 text-red-200"}`}>
            {test.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
            <div>
              {test.ok ? <>Model replied in {test.ms} ms: “{test.reply}”</> : test.error}
              {test.embedding && <div className="text-xs opacity-80">Embeddings: {test.embedding}</div>}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-ink-700 bg-ink-900/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">System prompt</h3>
            <p className="mt-0.5 text-xs text-slate-500">The assistant&apos;s personality and core instructions. Grounding & citation rules are appended automatically.</p>
          </div>
          <button onClick={() => setS({ ...s, systemPrompt: s.defaultSystemPrompt })} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-ink-800 hover:text-white">
            <RotateCcw size={13} /> Reset to default
          </button>
        </div>
        <textarea className={`${input} mt-3 min-h-[300px] font-mono text-[13px] leading-relaxed`} value={s.systemPrompt} onChange={(e) => setS({ ...s, systemPrompt: e.target.value })} />
        <button onClick={() => save()} disabled={busy === "save"} className="brand-gradient mt-3 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-60">
          <Save size={15} /> Save prompt
        </button>
      </section>

      <section className="rounded-xl border border-ink-700 bg-ink-900/60 p-5">
        <h3 className="text-sm font-semibold text-white">Registered agent tools</h3>
        <p className="mt-0.5 text-xs text-slate-500">Tools available to the agent. More (web search, URL checker…) can be registered in <code className="text-cyan-300">src/server/ai/tools</code>.</p>
        <ul className="mt-3 space-y-1.5">
          {tools.map((t) => (
            <li key={t.name} className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm">
              <code className="text-cyan-300">{t.name}</code> <span className="text-slate-400">— {t.description}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
