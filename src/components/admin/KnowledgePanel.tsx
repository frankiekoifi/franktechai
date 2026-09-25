"use client";

import { api } from "@/lib/client/api";
import {
  ArrowLeft,
  Eye,
  FileUp,
  Link2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Markdown } from "../Markdown";

type DocSummary = {
  id: string;
  title: string;
  category: string;
  source: string | null;
  sourceType: string;
  status: string;
  indexedAt: string | null;
  createdAt: string;
  updatedAt: string;
  length: number;
  chunkCount: number;
};

type Draft = {
  id?: string;
  title: string;
  category: string;
  content: string;
  source: string;
  sourceType: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

type SearchResult = { chunkId: string; title: string; category: string; content: string; score: number };

const emptyDraft: Draft = { title: "", category: "General", content: "", source: "", sourceType: "manual", status: "published" };

const statusStyle: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  draft: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  archived: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

const input =
  "w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-brand/60";

export function KnowledgePanel() {
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [testQuery, setTestQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const { documents } = await api<{ documents: DocSummary[] }>("/api/knowledge");
      setDocs(documents);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => Array.from(new Set(docs.map((d) => d.category))).sort(), [docs]);
  const visible = docs.filter(
    (d) =>
      (category === "all" || d.category === category) &&
      (!filter || d.title.toLowerCase().includes(filter.toLowerCase())),
  );

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const openDoc = async (id: string) => {
    setBusy("open");
    try {
      const { document } = await api<{ document: Draft & { source: string | null } }>(`/api/knowledge/${id}`);
      setDraft({ ...document, source: document.source ?? "" });
      setPreview(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!draft) return;
    setBusy("save");
    setError(null);
    try {
      const body = JSON.stringify(draft);
      const { document } = draft.id
        ? await api<{ document: Draft }>(`/api/knowledge/${draft.id}`, { method: "PUT", body })
        : await api<{ document: Draft }>("/api/knowledge", { method: "POST", body });
      setDraft({ ...document, source: document.source ?? "" });
      flash("Saved and indexed for retrieval.");
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this knowledge document? The assistant will no longer use it.")) return;
    try {
      await api(`/api/knowledge/${id}`, { method: "DELETE" });
      setDraft(null);
      flash("Document deleted.");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy("import");
    setError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const { draft: d } = await api<{ draft: Omit<Draft, "category" | "status"> }>("/api/knowledge/import", { method: "POST", body: form });
      setDraft({ ...emptyDraft, ...d, status: "draft" });
      setPreview(false);
      flash("Text extracted. Review, choose a category and save.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const importUrl = async () => {
    if (!url.trim()) return;
    setBusy("url");
    setError(null);
    try {
      const { draft: d } = await api<{ draft: Omit<Draft, "category" | "status"> }>("/api/knowledge/import", {
        method: "POST",
        body: JSON.stringify({ url: url.trim() }),
      });
      setDraft({ ...emptyDraft, ...d, status: "draft" });
      setUrlOpen(false);
      setUrl("");
      flash("Web content extracted. Clean it up, then save.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const reindex = async () => {
    setBusy("reindex");
    try {
      const r = await api<{ documents: number; chunks: number; embeddedDocuments: number }>("/api/knowledge/index", { method: "POST" });
      flash(`Re-indexed ${r.documents} documents into ${r.chunks} chunks${r.embeddedDocuments ? ` (${r.embeddedDocuments} with embeddings)` : ""}.`);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const runTest = async () => {
    if (!testQuery.trim()) return;
    setBusy("test");
    try {
      const { results } = await api<{ results: SearchResult[] }>(`/api/knowledge/search?q=${encodeURIComponent(testQuery)}`);
      setResults(results);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const banner = (
    <>
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={15} /></button>
        </div>
      )}
      {notice && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{notice}</div>}
    </>
  );

  if (draft) {
    return (
      <div>
        {banner}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button onClick={() => setDraft(null)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-300 hover:bg-ink-800">
            <ArrowLeft size={16} /> All documents
          </button>
          <div className="flex-1" />
          <button onClick={() => setPreview(!preview)} className="flex items-center gap-1.5 rounded-lg border border-ink-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-ink-800">
            {preview ? <Pencil size={15} /> : <Eye size={15} />} {preview ? "Edit" : "Preview"}
          </button>
          {draft.id && (
            <button onClick={() => remove(draft.id!)} className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10">
              <Trash2 size={15} /> Delete
            </button>
          )}
          <button
            onClick={save}
            disabled={busy === "save"}
            className="brand-gradient flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold text-ink-950 disabled:opacity-60"
          >
            {busy === "save" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save & index
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs text-slate-400">Title</span>
            <input className={input} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Wi-Fi Troubleshooting Guide" />
          </label>
          <label>
            <span className="mb-1 block text-xs text-slate-400">Category</span>
            <input className={input} list="kb-categories" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
            <datalist id="kb-categories">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>
          <label>
            <span className="mb-1 block text-xs text-slate-400">Status</span>
            <select className={input} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              <option value="published">Published (used by AI)</option>
              <option value="draft">Draft (not used)</option>
              <option value="archived">Archived (not used)</option>
            </select>
          </label>
          <label className="sm:col-span-2 lg:col-span-4">
            <span className="mb-1 block text-xs text-slate-400">Source (URL, file name, department…)</span>
            <input className={input} value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} placeholder="Optional" />
          </label>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
            <span>Content (Markdown supported)</span>
            <span>{draft.content.length.toLocaleString()} characters</span>
          </div>
          {preview ? (
            <div className="min-h-[420px] rounded-xl border border-ink-600 bg-ink-900 p-5">
              <Markdown content={draft.content || "_Nothing to preview_"} />
            </div>
          ) : (
            <textarea
              className={`${input} min-h-[420px] font-mono text-[13px] leading-relaxed`}
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder={"# Procedure title\n\n## Requirements\n- ...\n\n## Steps\n1. ..."}
            />
          )}
        </div>
        {draft.updatedAt && (
          <p className="mt-2 text-xs text-slate-500">
            Created {new Date(draft.createdAt!).toLocaleString()} · Updated {new Date(draft.updatedAt).toLocaleString()} · Type: {draft.sourceType}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {banner}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className={`${input} pl-9`} placeholder="Filter by title…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <select className={`${input} w-auto`} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input ref={fileRef} type="file" hidden accept=".pdf,.docx,.txt,.md,.markdown,.html,.htm" onChange={(e) => importFile(e.target.files?.[0])} />
        <button onClick={() => fileRef.current?.click()} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg border border-ink-600 px-3 py-2 text-sm text-slate-200 hover:bg-ink-800 disabled:opacity-50">
          {busy === "import" ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />} Upload file
        </button>
        <button onClick={() => setUrlOpen(!urlOpen)} className="flex items-center gap-1.5 rounded-lg border border-ink-600 px-3 py-2 text-sm text-slate-200 hover:bg-ink-800">
          <Link2 size={15} /> From URL
        </button>
        <button onClick={reindex} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg border border-ink-600 px-3 py-2 text-sm text-slate-200 hover:bg-ink-800 disabled:opacity-50">
          <RefreshCw size={15} className={busy === "reindex" ? "animate-spin" : ""} /> Re-index
        </button>
        <button onClick={() => { setDraft({ ...emptyDraft }); setPreview(false); }} className="brand-gradient flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-950">
          <Plus size={16} /> New article
        </button>
      </div>

      {urlOpen && (
        <div className="mb-4 flex gap-2 rounded-xl border border-ink-600 bg-ink-900 p-3">
          <input className={input} placeholder="https://example.com/guide" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && importUrl()} />
          <button onClick={importUrl} disabled={busy === "url"} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-cyan-500/20 px-4 text-sm text-cyan-200 hover:bg-cyan-500/30">
            {busy === "url" && <Loader2 size={14} className="animate-spin" />} Import
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-850 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="hidden px-4 py-2.5 font-medium md:table-cell">Category</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Chunks</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {loading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500"><Loader2 size={18} className="mx-auto animate-spin" /></td></tr>
            )}
            {!loading && visible.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No documents found.</td></tr>
            )}
            {visible.map((d) => (
              <tr key={d.id} onClick={() => openDoc(d.id)} className="cursor-pointer bg-ink-900/40 transition hover:bg-ink-800">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-100">{d.title}</div>
                  <div className="mt-0.5 max-w-md truncate text-xs text-slate-500">{d.source ?? d.sourceType}</div>
                </td>
                <td className="hidden px-4 py-3 text-slate-400 md:table-cell">{d.category}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md border px-2 py-0.5 text-xs ${statusStyle[d.status] ?? ""}`}>{d.status}</span>
                </td>
                <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">{d.chunkCount}</td>
                <td className="hidden px-4 py-3 text-xs text-slate-500 sm:table-cell">{new Date(d.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-xl border border-ink-700 bg-ink-900/60 p-4">
        <h3 className="text-sm font-semibold text-white">Retrieval tester</h3>
        <p className="mt-0.5 text-xs text-slate-500">See which knowledge chunks the assistant would receive for a question.</p>
        <div className="mt-3 flex gap-2">
          <input className={input} placeholder="e.g. printer offline epson" value={testQuery} onChange={(e) => setTestQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} />
          <button onClick={runTest} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-500/20 px-4 text-sm text-violet-200 hover:bg-violet-500/30">
            {busy === "test" ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Search
          </button>
        </div>
        {results && (
          <div className="mt-3 space-y-2">
            {results.length === 0 && <p className="text-xs text-slate-500">No relevant knowledge found — the assistant would answer from general knowledge and say so.</p>}
            {results.map((r) => (
              <div key={r.chunkId} className="rounded-lg border border-ink-700 bg-ink-850 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-cyan-200">{r.title} <span className="text-slate-500">· {r.category}</span></span>
                  <span className="font-mono text-slate-500">score {r.score.toFixed(3)}</span>
                </div>
                <p className="mt-1 line-clamp-3 text-xs text-slate-400">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
