"use client";

import { api, type User } from "@/lib/client/api";
import { Loader2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { LogoMark } from "../Logo";

export function AuthModal({
  open,
  onClose,
  onAuthed,
  setupRequired,
}: {
  open: boolean;
  onClose: () => void;
  onAuthed: (u: User) => void;
  setupRequired?: boolean;
}) {
  const [mode, setMode] = useState<"login" | "register">(setupRequired ? "register" : "login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { user } = await api<{ user: User }>(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      onAuthed(user);
      setPassword("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-brand/70 focus:ring-2 focus:ring-cyan-brand/20";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-ink-700" aria-label="Close">
          <X size={18} />
        </button>
        <div className="mb-5 flex flex-col items-center gap-3 text-center">
          <LogoMark size={44} />
          <div>
            <h2 className="text-lg font-semibold text-white">
              {mode === "login" ? "Sign in to FrankTechSpace AI" : "Create your account"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {setupRequired && mode === "register"
                ? "No accounts exist yet — the first account becomes the administrator."
                : "Save your conversation history across devices."}
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input
            className={input}
            type="password"
            required
            minLength={mode === "register" ? 8 : 1}
            placeholder={mode === "register" ? "Password (min 8 characters)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
          <button
            disabled={busy}
            className="brand-gradient flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-ink-950 transition hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
          <button
            className="font-medium text-cyan-300 hover:underline"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
