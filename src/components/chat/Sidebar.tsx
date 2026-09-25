"use client";

import type { ConversationSummary, User } from "@/lib/client/api";
import {
  Check,
  LogIn,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LogoFull } from "../Logo";

function groupByDate(items: ConversationSummary[]) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 86400_000;
  const groups: { label: string; items: ConversationSummary[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Previous 30 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const c of items) {
    const t = new Date(c.updatedAt).getTime();
    if (t >= startToday) groups[0].items.push(c);
    else if (t >= startToday - day) groups[1].items.push(c);
    else if (t >= startToday - 7 * day) groups[2].items.push(c);
    else if (t >= startToday - 30 * day) groups[3].items.push(c);
    else groups[4].items.push(c);
  }
  return groups.filter((g) => g.items.length);
}

export function Sidebar(props: {
  open: boolean;
  onClose: () => void;
  conversations: ConversationSummary[];
  loading: boolean;
  activeId: string | null;
  user: User | null;
  onNew: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  const groups = useMemo(() => groupByDate(props.conversations), [props.conversations]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const commitRename = async (id: string) => {
    const t = draft.trim();
    setEditing(null);
    if (t) await props.onRename(id, t);
  };

  return (
    <>
      {props.open && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] md:hidden" onClick={props.onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-ink-700 bg-ink-900/95 backdrop-blur transition-transform duration-200 md:static md:translate-x-0 ${
          props.open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <LogoFull />
          <button onClick={props.onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-ink-700 md:hidden" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={props.onNew}
            className="group flex w-full items-center gap-2 rounded-xl border border-cyan-brand/30 bg-cyan-brand/10 px-3 py-2.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-brand/60 hover:bg-cyan-brand/15"
          >
            <Plus size={17} className="transition group-hover:rotate-90" />
            New chat
          </button>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto px-2 pb-4">
          {props.loading && (
            <div className="space-y-2 px-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded-lg bg-ink-800" />
              ))}
            </div>
          )}
          {!props.loading && groups.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-slate-500">
              No conversations yet.
              <br />
              Ask your first question!
            </p>
          )}
          {groups.map((g) => (
            <div key={g.label} className="mb-3">
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{g.label}</div>
              {g.items.map((c) => {
                const active = c.id === props.activeId;
                if (editing === c.id) {
                  return (
                    <div key={c.id} className="flex items-center gap-1 rounded-lg bg-ink-800 px-2 py-1">
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename(c.id);
                          if (e.key === "Escape") setEditing(null);
                        }}
                        className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-white outline-none"
                      />
                      <button onClick={() => commitRename(c.id)} className="p-1 text-cyan-300" aria-label="Save">
                        <Check size={15} />
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1 text-slate-400" aria-label="Cancel">
                        <X size={15} />
                      </button>
                    </div>
                  );
                }
                return (
                  <div
                    key={c.id}
                    className={`group relative flex items-center rounded-lg transition ${
                      active ? "bg-ink-700 text-white" : "text-slate-300 hover:bg-ink-800"
                    }`}
                  >
                    {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded bg-cyan-brand" />}
                    <button onClick={() => props.onSelect(c.id)} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm">
                      <MessageSquare size={14} className="shrink-0 text-slate-500" />
                      <span className="truncate">{c.title}</span>
                    </button>
                    {confirmDelete === c.id ? (
                      <div className="flex items-center gap-0.5 pr-1.5">
                        <button
                          onClick={async () => {
                            setConfirmDelete(null);
                            await props.onDelete(c.id);
                          }}
                          className="rounded px-1.5 py-0.5 text-[11px] font-medium text-red-300 hover:bg-red-500/15"
                        >
                          Delete
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="p-1 text-slate-400" aria-label="Cancel">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center pr-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setEditing(c.id);
                            setDraft(c.title);
                          }}
                          className="rounded p-1 text-slate-400 hover:text-cyan-200"
                          aria-label="Rename"
                        >
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setConfirmDelete(c.id)} className="rounded p-1 text-slate-400 hover:text-red-300" aria-label="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-ink-700 p-3">
          {props.user ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-xs font-bold text-white">
                  {props.user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">{props.user.name}</div>
                  <div className="truncate text-[11px] text-slate-500">
                    {props.user.role === "admin" ? "Administrator" : props.user.email}
                  </div>
                </div>
                <button onClick={props.onSignOut} className="rounded-lg p-1.5 text-slate-400 hover:bg-ink-700 hover:text-white" title="Sign out">
                  <LogOut size={16} />
                </button>
              </div>
              {props.user.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-violet-200 hover:bg-violet-500/10">
                  <Shield size={15} /> Knowledge & settings
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="px-1 text-[11px] leading-relaxed text-slate-500">
                Chatting as guest. History is kept in this browser only.
              </p>
              <button
                onClick={props.onSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink-600 px-3 py-2 text-sm text-slate-200 hover:border-ink-600 hover:bg-ink-800"
              >
                <LogIn size={15} /> Sign in
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
