import React, { useState } from "react";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

import { ApiError, SessionAPI } from "../../lib/sync";
import { themeSystem } from "../../lib/themeSystem";
import { playSound } from "../../utils/audio";

export type AccountMode = "signIn" | "signUp";

const field =
  "w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-400 dark:focus:border-indigo-500/60 outline-none transition disabled:opacity-60";

const labelClass = "block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1";

export interface AccountFormProps {
  /** Called after the session exists, so a screen can leave itself. */
  onSignedIn?: () => void;
  autoFocus?: boolean;
}

/**
 * The credentials form itself, with no opinion about where it sits.
 *
 * Shared by the Settings card and the full sign-in screen so there is one set
 * of validation rules and one set of error sentences — two copies of a login
 * form is how two different messages for the same failure happen.
 */
export const AccountForm: React.FC<AccountFormProps> = ({ onSignedIn, autoFocus = false }) => {
  const [mode, setMode] = useState<AccountMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: AccountMode) => {
    setMode(next);
    setError(null);
    setPassword("");
    playSound("pop");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    try {
      if (mode === "signUp") {
        await SessionAPI.signUp(email.trim(), password, familyName.trim() || "My family");
      } else {
        await SessionAPI.signIn(email.trim(), password);
      }
      playSound("pop");
      setPassword("");
      onSignedIn?.();
    } catch (err) {
      const problem = err as ApiError;
      setError(
        problem.isOffline
          ? "No connection to the data service. Your work is saved on this device either way."
          : problem.message,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="tablist" aria-label="Account">
        {(
          [
            ["signIn", "Sign in"],
            ["signUp", "Create account"],
          ] as const
        ).map(([id, text]) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            onClick={() => switchMode(id)}
            className={themeSystem.button(mode === id ? "primary" : "secondary", "sm")}
          >
            {text}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="account-email">
            Email
          </label>
          <input
            id="account-email"
            type="email"
            required
            // eslint-disable-next-line jsx-a11y/no-autofocus -- the screen exists to be typed in
            autoFocus={autoFocus}
            autoComplete="email"
            value={email}
            disabled={busy}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="account-password">
            Password
          </label>
          <div className="relative">
            <input
              id="account-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete={mode === "signUp" ? "new-password" : "current-password"}
              value={password}
              disabled={busy}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className={`${field} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mode === "signUp" && (
          <div>
            <label className={labelClass} htmlFor="account-family">
              Family name
            </label>
            <input
              id="account-family"
              type="text"
              maxLength={60}
              value={familyName}
              disabled={busy}
              placeholder="The Riveras"
              onChange={(e) => setFamilyName(e.target.value)}
              className={field}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              What the children's accounts will sit under. You can change it later.
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900/60 rounded-xl px-3 py-2"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className={themeSystem.button("primary", "md", "w-full")}
        >
          {mode === "signUp" ? <UserPlus /> : <LogIn />}
          {busy ? "Working…" : mode === "signUp" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
};
