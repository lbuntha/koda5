import React from "react";
import { ShieldCheck } from "lucide-react";

import { themeSystem } from "../../lib/themeSystem";
import { AccountForm } from "./AccountForm";

/**
 * The gate. Nothing in the app renders until this has a session.
 *
 * It takes no props and offers no way past: signing in is required (App.tsx),
 * so an escape hatch here would lead nowhere. Once a device *has* signed in the
 * session is local, and lessons keep working with no connection — the one thing
 * that now needs a network is this screen, on a device that has never used it.
 */
export const SignInScreen: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md space-y-5">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-mono font-black text-2xl text-slate-900 dark:text-white tracking-tight">
          Sign in to Koda
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Sign in to continue. Once this device is signed in, lessons keep working with no
          connection.
        </p>
      </div>

      <div className={themeSystem.card("default", "p-5 sm:p-6")}>
        <AccountForm autoFocus />
      </div>
    </div>
  </div>
);
