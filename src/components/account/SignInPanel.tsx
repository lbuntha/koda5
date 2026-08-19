import React from "react";
import { LogOut, ShieldCheck } from "lucide-react";

import { SessionAPI, useSession } from "../../lib/sync";
import { themeSystem } from "../../lib/themeSystem";
import { playSound } from "../../utils/audio";
import { UIBadge, UISectionHeader } from "../ui";

/**
 * The account card in Settings: who this device is signed in as, and the way
 * out. There is no form here — signing in happens at the gate, and a second
 * copy of it in Settings would be a page nobody can reach.
 */
export const SignInPanel: React.FC = () => {
  const session = useSession();
  if (!session) return null;

  return (
    <section className={themeSystem.card("default", `${themeSystem.spacing.card} space-y-4`)}>
      <UISectionHeader
        title="Account"
        subtitle="Where this device's record is kept"
        icon={<ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 dark:text-white truncate">
              {session.email ?? "Signed in"}
            </span>
            <UIBadge variant="primary">{session.role}</UIBadge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {session.familyName
              ? `${session.familyName} · this device is linked, so progress survives a reinstall.`
              : "Staff account — not part of a family."}
          </p>
        </div>

        <button
          onClick={() => {
            playSound("pop");
            void SessionAPI.signOut();
          }}
          className={themeSystem.button("secondary", "sm")}
        >
          <LogOut />
          Sign out
        </button>
      </div>
    </section>
  );
};
