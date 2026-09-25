"use client";

import {
  api,
  streamChat,
  type AssistantStatus,
  type Attachment,
  type ChatMessage,
  type ConversationSummary,
  type Source,
  type User,
} from "@/lib/client/api";
import {
  BookOpen,
  Cpu,
  Eraser,
  FileSearch,
  Globe,
  Menu,
  Printer,
  Settings,
  Wifi,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthModal } from "../auth/AuthModal";
import { LogoMark } from "../Logo";
import { Composer } from "./Composer";
import { MessageItem } from "./MessageItem";
import { Sidebar } from "./Sidebar";

type Streaming = { content: string; sources: Source[]; model: string | null };

const SUGGESTIONS = [
  { icon: Printer, text: "The printer is offline. What should I check?" },
  { icon: Wifi, text: "My computer has no internet." },
  { icon: Globe, text: "How do I apply for a KRA PIN?" },
  { icon: FileSearch, text: "How do I scan a document and save it as PDF?" },
  { icon: Cpu, text: "How do I troubleshoot a slow computer?" },
  { icon: BookOpen, text: "What should I do if eCitizen is not loading?" },
];

function setUrlConversation(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("c", id);
  else url.searchParams.delete("c");
  window.history.replaceState(null, "", url.toString());
}

export function ChatApp() {
  const [user, setUser] = useState<User | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [streaming, setStreaming] = useState<Streaming | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const activeRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  activeRef.current = activeId;

  const refreshList = useCallback(async () => {
    try {
      const { conversations } = await api<{ conversations: ConversationSummary[] }>("/api/conversations");
      setConversations(conversations);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setLoadingConv(true);
    setError(null);
    try {
      const data = await api<{ messages: ChatMessage[] }>(`/api/conversations/${id}`);
      if (activeRef.current === id) setMessages(data.messages);
    } catch (e) {
      setError((e as Error).message);
      if ((e as { status?: number }).status === 404) {
        setActiveId(null);
        setUrlConversation(null);
      }
    } finally {
      setLoadingConv(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const me = await api<{ user: User | null; setupRequired: boolean }>("/api/auth/me");
        setUser(me.user);
        setSetupRequired(me.setupRequired);
      } catch {}
      api<AssistantStatus>("/api/status").then(setStatus).catch(() => {});
      await refreshList();
      const c = new URL(window.location.href).searchParams.get("c");
      if (c) {
        setActiveId(c);
        activeRef.current = c;
        loadConversation(c);
      }
    })();
  }, [refreshList, loadConversation]);

  // Auto-scroll while streaming unless the user scrolled up
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const selectConversation = (id: string) => {
    if (streaming) abortRef.current?.abort();
    setSidebarOpen(false);
    if (id === activeId) return;
    setActiveId(id);
    activeRef.current = id;
    setMessages([]);
    setUrlConversation(id);
    loadConversation(id);
  };

  const newChat = () => {
    if (streaming) abortRef.current?.abort();
    setActiveId(null);
    activeRef.current = null;
    setMessages([]);
    setError(null);
    setUrlConversation(null);
    setSidebarOpen(false);
  };

  const run = async (body: {
    message?: string;
    attachmentIds?: string[];
    regenerate?: boolean;
    optimistic?: ChatMessage;
  }) => {
    setError(null);
    stickRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    let convId = activeRef.current;
    let partial: Streaming = { content: "", sources: [], model: null };
    setStreaming(partial);
    let finished = false;

    try {
      for await (const ev of streamChat(
        {
          conversationId: convId,
          message: body.message,
          attachmentIds: body.attachmentIds,
          regenerate: body.regenerate,
        },
        controller.signal,
      )) {
        if (ev.type === "start") {
          if (!convId) {
            convId = ev.conversationId;
            setActiveId(convId);
            activeRef.current = convId;
            setUrlConversation(convId);
          }
          if (ev.userMessage) {
            const real = ev.userMessage;
            setMessages((m) => m.map((x) => (x.id === body.optimistic?.id ? real : x)));
          }
          partial = { ...partial, sources: ev.sources, model: ev.model };
          setStreaming(partial);
          refreshList();
        } else if (ev.type === "title") {
          setConversations((list) => list.map((c) => (c.id === convId ? { ...c, title: ev.title } : c)));
        } else if (ev.type === "token") {
          partial = { ...partial, content: partial.content + ev.value };
          setStreaming(partial);
        } else if (ev.type === "done") {
          finished = true;
          if (activeRef.current === convId) setMessages((m) => [...m, ev.message]);
        } else if (ev.type === "error") {
          finished = true;
          if (ev.message) {
            const msg = ev.message;
            if (activeRef.current === convId) setMessages((m) => [...m, msg]);
          } else {
            setError(ev.error);
            if (body.optimistic) setMessages((m) => m.filter((x) => x.id !== body.optimistic!.id));
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        // Server persists the partial answer as "stopped"; sync after it saves.
        if (!finished && convId && activeRef.current === convId) {
          const id = convId;
          setMessages((m) => [
            ...m,
            {
              id: `stopped-${Date.now()}`,
              role: "assistant",
              content: partial.content || "_Generation stopped._",
              sources: [],
              attachments: [],
              model: partial.model,
              status: "stopped",
              createdAt: new Date().toISOString(),
            },
          ]);
          setTimeout(() => {
            if (activeRef.current === id) loadConversation(id);
          }, 900);
        }
      } else {
        setError((e as Error).message || "Connection lost");
        if (body.optimistic) setMessages((m) => m.filter((x) => x.id !== body.optimistic!.id));
      }
    } finally {
      setStreaming(null);
      abortRef.current = null;
      refreshList();
    }
  };

  const send = (text: string, attachmentIds: string[], attachments: Attachment[]) => {
    if (streaming) return;
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: text || "Please review the attached file(s) and summarise the important information.",
      sources: [],
      attachments,
      model: null,
      status: "complete",
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    run({ message: text, attachmentIds, optimistic });
  };

  const regenerate = () => {
    if (streaming || !activeId) return;
    setMessages((m) => (m[m.length - 1]?.role === "assistant" ? m.slice(0, -1) : m));
    run({ regenerate: true });
  };

  const stop = () => abortRef.current?.abort();

  const clearConversation = async () => {
    if (!activeId || streaming) return;
    if (!window.confirm("Clear all messages in this conversation?")) return;
    try {
      await api(`/api/conversations/${activeId}/messages`, { method: "DELETE" });
      setMessages([]);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const rename = async (id: string, title: string) => {
    try {
      await api(`/api/conversations/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
      setConversations((l) => l.map((c) => (c.id === id ? { ...c, title } : c)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (id: string) => {
    try {
      await api(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((l) => l.filter((c) => c.id !== id));
      if (id === activeId) newChat();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onAuthed = async (u: User) => {
    setUser(u);
    setSetupRequired(false);
    setAuthOpen(false);
    await refreshList();
  };

  const signOut = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    newChat();
    setLoadingList(true);
    await refreshList();
  };

  const activeTitle = conversations.find((c) => c.id === activeId)?.title;
  const lastAssistantIdx = messages.map((m) => m.role).lastIndexOf("assistant");
  const empty = messages.length === 0 && !streaming && !loadingConv;

  return (
    <div className="flex h-dvh overflow-hidden bg-ink-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        loading={loadingList}
        activeId={activeId}
        user={user}
        onNew={newChat}
        onSelect={selectConversation}
        onRename={rename}
        onDelete={remove}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={signOut}
      />

      <main className="grid-bg relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-ink-700/70 bg-ink-950/70 px-3 backdrop-blur sm:px-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-300 hover:bg-ink-800 md:hidden" aria-label="Open sidebar">
            <Menu size={19} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{activeTitle ?? "FrankTechSpace AI"}</div>
            {status && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${status.mode === "llm" ? "bg-emerald-400" : "bg-amber-400"}`} />
                {status.mode === "llm" ? `AI online · ${status.model}` : "Knowledge-base mode (no AI model connected)"}
                <span className="hidden sm:inline">· {status.knowledge.published} knowledge articles</span>
              </div>
            )}
          </div>
          {activeId && messages.length > 0 && (
            <button
              onClick={clearConversation}
              disabled={!!streaming}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-ink-800 hover:text-white disabled:opacity-40"
              title="Clear conversation"
            >
              <Eraser size={15} /> <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          <Link
            href="/admin"
            className="rounded-lg p-2 text-slate-400 hover:bg-ink-800 hover:text-cyan-200"
            title="Knowledge base & settings (admin)"
          >
            <Settings size={18} />
          </Link>
        </header>

        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
          {empty ? (
            <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
              <LogoMark size={64} />
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                FrankTechSpace <span className="brand-text">AI</span>
              </h1>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Ask anything about technology, digital services, troubleshooting and FrankTechSpace procedures.
              </p>
              <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => send(s.text, [], [])}
                    className="group flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-cyan-brand/40 hover:bg-ink-800 hover:text-white"
                  >
                    <s.icon size={17} className="shrink-0 text-cyan-400/80 group-hover:text-cyan-300" />
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-7 px-4 py-6 sm:py-8">
              {loadingConv && messages.length === 0 && (
                <div className="space-y-4">
                  <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-ink-800" />
                  <div className="h-24 w-4/5 animate-pulse rounded-2xl bg-ink-800/70" />
                </div>
              )}
              {messages.map((m, i) => (
                <MessageItem
                  key={m.id}
                  message={m}
                  canRegenerate={i === lastAssistantIdx && i === messages.length - 1 && !streaming && !m.id.startsWith("stopped-")}
                  onRegenerate={regenerate}
                />
              ))}
              {streaming && (
                <MessageItem
                  streaming
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streaming.content,
                    sources: streaming.sources,
                    attachments: [],
                    model: streaming.model,
                    status: "complete",
                    createdAt: new Date().toISOString(),
                  }}
                />
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-auto mb-2 flex w-full max-w-3xl items-start gap-2 px-4">
            <div className="flex flex-1 items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        <Composer busy={!!streaming} onSend={send} onStop={stop} />
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={onAuthed} setupRequired={setupRequired} />
    </div>
  );
}
