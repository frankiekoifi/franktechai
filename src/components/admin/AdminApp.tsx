"use client";

import { api, type User } from "@/lib/client/api";
import { ArrowLeft, BookOpen, Loader2, LogOut, Settings2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthModal } from "../auth/AuthModal";
import { LogoFull } from "../Logo";
import { KnowledgePanel } from "./KnowledgePanel";
import { SettingsPanel } from "./SettingsPanel";

export function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"knowledge" | "settings">("knowledge");

  useEffect(() => {
    api<{ user: User | null; setupRequired: boolean }>("/api/auth/me")
      .then((d) => {
        setUser(d.user);
        setSetupRequired(d.setupRequired);
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  };

  if (loading) {
    return (
      <div className="grid h-dvh place-items-center">
        <Loader2 className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="grid-bg grid min-h-dvh place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-ink-600 bg-ink-850 p-8 text-center">
          <ShieldAlert className="mx-auto text-violet-300" size={36} />
          <h1 className="mt-3 text-lg font-semibold text-white">Administrator access required</h1>
          <p className="mt-1 text-sm text-slate-400">
            {user
              ? "Your account doesn't have admin rights. Ask a FrankTechSpace administrator."
              : setupRequired
                ? "No accounts exist yet. Create the first account — it becomes the administrator."
                : "Sign in with an administrator account to manage the knowledge base and AI settings."}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/" className="rounded-lg border border-ink-600 px-4 py-2 text-sm text-slate-300 hover:bg-ink-800">Back to chat</Link>
            {user ? (
              <button onClick={signOut} className="rounded-lg border border-ink-600 px-4 py-2 text-sm text-slate-300 hover:bg-ink-800">Sign out</button>
            ) : null}
          </div>
        </div>
        <AuthModal
          open={!user}
          onClose={() => {}}
          setupRequired={setupRequired}
          onAuthed={(u) => {
            setUser(u);
            setSetupRequired(false);
          }}
        />
      </div>
    );
  }

  const tabs = [
    { id: "knowledge" as const, label: "Knowledge base", icon: BookOpen },
    { id: "settings" as const, label: "AI settings", icon: Settings2 },
  ];

  return (
    <div className="grid-bg min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-ink-700 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="rounded-lg p-2 text-slate-400 hover:bg-ink-800 hover:text-white" title="Back to chat">
            <ArrowLeft size={18} />
          </Link>
          <LogoFull />
          <span className="ml-1 hidden rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-200 sm:inline">Admin</span>
          <div className="flex-1" />
          <span className="hidden text-sm text-slate-400 sm:inline">{user.name}</span>
          <button onClick={signOut} className="rounded-lg p-2 text-slate-400 hover:bg-ink-800 hover:text-white" title="Sign out">
            <LogOut size={17} />
          </button>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 px-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-sm transition ${
                tab === t.id ? "border-cyan-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{tab === "knowledge" ? <KnowledgePanel /> : <SettingsPanel />}</main>
    </div>
  );
}
