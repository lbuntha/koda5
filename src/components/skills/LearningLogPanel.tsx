import React, { useMemo, useState, useSyncExternalStore } from "react";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FlagTriangleRight,
  Trash2,
} from "lucide-react";
import { themeSystem } from "../../lib/themeSystem";
import { UIBadge, UIDataTable, type UIDataTableColumn, UIStatGrid, UIStatTile } from "../ui";
import { playSound } from "../../utils/audio";
import {
  APP_VERSION,
  type ConceptMastery,
  LearningLog,
  type LearningEvent,
  type MasteryStatus,
  getAllMastery,
  getQuestionRecords,
  type QuestionRecord,
  type SkillTotals,
  learnerId,
} from "../../lib/learning";

/**
 * What the learning log knows, made visible.
 *
 * This is a teacher/developer surface, which is why it lives under the Skill
 * Manager
 * rather than anywhere a child navigates: it shows accuracy, error patterns and
 * raw events, none of which a five-year-old should be reading about themselves.
 */

const STATUS_TONE: Record<MasteryStatus, "success" | "warning" | "danger" | "neutral"> = {
  mastered: "success",
  practising: "warning",
  learning: "neutral",
  struggling: "danger",
  "not-started": "neutral",
};

/** Plain words for a taxonomy that is otherwise machine-readable only. */
const ERROR_COPY: Record<string, string> = {
  off_by_one: "one out",
  off_by_more: "not close",
  reversed: "wrong way round",
  guessed_fast: "answered too fast to have counted",
  timed_out: "ran out of time",
  miscounted_items: "counted the wrong number of things",
  sequence_slip: "lost the pattern",
  place_value: "tens and ones mixed up",
  unknown: "not classified",
};

const pct = (n: number) => `${Math.round(n * 100)}%`;
const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

const ConceptCard: React.FC<{ mastery: ConceptMastery }> = ({ mastery }) => (
  <div className={themeSystem.card("default", "p-4 space-y-3")}>
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
        {mastery.conceptKey}
      </span>
      <UIBadge variant={STATUS_TONE[mastery.status]}>{mastery.status}</UIBadge>
    </div>

    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs">
      {[
        ["First-try", pct(mastery.firstTryAccuracy)],
        ["Questions", String(mastery.questionsAnswered)],
        ["Avg time", secs(mastery.averageResponseMs)],
        ["Days", String(mastery.daysPractised)],
        ["Rounds done", String(mastery.lessonsCompleted)],
        ["Help used", pct(mastery.supportRate)],
      ].map(([label, value]) => (
        <div key={label}>
          <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
          <dd className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
            {value}
          </dd>
        </div>
      ))}
    </dl>

    {mastery.topErrors.length > 0 && (
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          What goes wrong
        </span>
        <ul className="mt-1.5 space-y-1">
          {mastery.topErrors.map((e) => (
            <li key={e.kind} className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-mono font-bold tabular-nums">{e.count}×</span>{" "}
              {ERROR_COPY[e.kind] ?? e.kind}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

/**
 * The detail line for one event, decoded into something readable.
 *
 * Each event type carries different fields, so this is where the union is
 * flattened for display — the table itself stays generic.
 */
const describe = (event: LearningEvent): string => {
  switch (event.type) {
    case "answer_submitted":
      return [
        event.correct ? "correct" : "wrong",
        secs(event.responseMs),
        event.given ? `said ${event.given}` : "",
        event.expected ? `wanted ${event.expected}` : "",
        event.errorKind ? ERROR_COPY[event.errorKind] ?? event.errorKind : "",
        event.attempt > 1 ? `attempt ${event.attempt}` : "",
        event.supportsUsed > 0 ? `${event.supportsUsed} help` : "",
      ]
        .filter(Boolean)
        .join(" · ");
    case "question_presented":
      return [`#${event.index}`, event.taskKind, event.expected ? `answer ${event.expected}` : ""]
        .filter(Boolean)
        .join(" · ");
    case "support_used":
      return event.hintLevel ? `${event.support} (level ${event.hintLevel})` : event.support;
    case "lesson_completed":
      return `${event.correctFirstTry}/${event.questionsAnswered} first try · ${secs(
        event.medianResponseMs,
      )} median · ${secs(event.durationMs)} total`;
    case "lesson_abandoned":
      return `left after ${event.questionsAnswered} · ${secs(event.durationMs)}`;
    case "lesson_started":
      return `via ${event.entry}`;
    default:
      return "";
  }
};

/**
 * Date and time in the learner's own timezone.
 *
 * The stored `ts` is UTC, which is right for storage and wrong for reading: a
 * teacher looking at "was this the same evening or two days?" needs the child's
 * clock, not the server's.
 */
const localTime = (iso: string): string => {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { day: "2-digit", month: "short" })} ${d.toLocaleTimeString(
    undefined,
    { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false },
  )}`;
};

const mins = (ms: number) => (ms < 60_000 ? `${Math.round(ms / 1000)}s` : `${Math.round(ms / 60_000)}m`);

const SKILL_COLUMNS: UIDataTableColumn<SkillTotals>[] = [
  { key: "skill", header: "Skill", render: (s) => s.skillId, sortValue: (s) => s.skillId, nowrap: true },
  {
    key: "plays",
    header: "Plays",
    render: (s) => s.plays,
    sortValue: (s) => s.plays,
    align: "right",
    numeric: true,
  },
  {
    key: "completed",
    header: "Finished",
    // Rounds opened but not finished are the interesting number here, so the
    // completion rate sits next to the count rather than replacing it.
    render: (s) => (s.plays > 0 ? `${s.completed} (${pct(s.completed / s.plays)})` : "0"),
    sortValue: (s) => (s.plays > 0 ? s.completed / s.plays : 0),
    align: "right",
    numeric: true,
    nowrap: true,
  },
  {
    key: "abandoned",
    header: "Left early",
    render: (s) => s.abandoned || "",
    sortValue: (s) => s.abandoned,
    align: "right",
    numeric: true,
    muted: true,
  },
  {
    key: "questions",
    header: "Questions",
    render: (s) => s.questionsAnswered,
    sortValue: (s) => s.questionsAnswered,
    align: "right",
    numeric: true,
  },
  {
    key: "accuracy",
    header: "First-try",
    render: (s) => (s.questionsAnswered > 0 ? pct(s.correctFirstTry / s.questionsAnswered) : "—"),
    sortValue: (s) => (s.questionsAnswered > 0 ? s.correctFirstTry / s.questionsAnswered : -1),
    align: "right",
    numeric: true,
  },
  {
    key: "time",
    header: "Time",
    render: (s) => mins(s.totalTimeMs),
    sortValue: (s) => s.totalTimeMs,
    align: "right",
    numeric: true,
  },
  {
    key: "days",
    header: "Days",
    render: (s) => s.daysUsed.length,
    sortValue: (s) => s.daysUsed.length,
    align: "right",
    numeric: true,
    muted: true,
  },
  {
    key: "last",
    header: "Last played",
    render: (s) => localTime(s.lastUsedTs),
    sortValue: (s) => s.lastUsedTs,
    numeric: true,
    nowrap: true,
    muted: true,
  },
];

const QUESTION_COLUMNS: UIDataTableColumn<QuestionRecord>[] = [
  {
    key: "askedAt",
    header: "Date & time",
    render: (q) => localTime(q.askedAt),
    sortValue: (q) => q.askedAt,
    numeric: true,
    nowrap: true,
    muted: true,
  },
  {
    key: "lesson",
    header: "Lesson",
    render: (q) => `${q.levelNumber ? `L${q.levelNumber} ` : ""}${q.lessonId}`,
    sortValue: (q) => q.levelNumber ?? 0,
    nowrap: true,
    muted: true,
  },
  {
    key: "prompt",
    header: "Question",
    // Falls back to the machine key when a skill has not reported its prompt —
    // visibly incomplete beats a blank cell that looks like there was no question.
    render: (q) => q.prompt ?? <span className="italic">{q.taskKind}</span>,
    sortValue: (q) => q.prompt ?? q.taskKind,
  },
  {
    key: "answer",
    header: "Answer",
    render: (q) =>
      q.unanswered ? (
        <span className="text-slate-400 dark:text-slate-500">—</span>
      ) : (
        <>
          {q.given ?? "✓"}
          {q.expected && q.given !== q.expected && (
            <span className="text-slate-500 dark:text-slate-400"> (want {q.expected})</span>
          )}
        </>
      ),
    numeric: true,
    nowrap: true,
  },
  {
    key: "result",
    header: "Result",
    render: (q) => {
      if (q.unanswered) return <UIBadge variant="neutral">no answer</UIBadge>;
      if (q.correctFirstTry) return <UIBadge variant="success">correct</UIBadge>;
      if (q.eventuallyCorrect) {
        // Right first time but with a hint is a different state from right on
        // the third try, and "correct on 1" described neither.
        return (
          <UIBadge variant="warning">
            {q.attempts > 1 ? `correct on try ${q.attempts}` : "correct with help"}
          </UIBadge>
        );
      }
      return <UIBadge variant="danger">{ERROR_COPY[q.errorKind ?? ""] ?? "wrong"}</UIBadge>;
    },
    // Sorted worst-first so the rows worth reading come to the top.
    sortValue: (q) => (q.unanswered ? 0 : q.eventuallyCorrect ? (q.correctFirstTry ? 3 : 2) : 1),
    nowrap: true,
  },
  {
    key: "time",
    header: "Time",
    render: (q) => (q.unanswered ? "—" : secs(q.timeMs)),
    sortValue: (q) => q.timeMs,
    align: "right",
    numeric: true,
    nowrap: true,
  },
  {
    key: "help",
    header: "Help",
    render: (q) => (q.supports > 0 ? String(q.supports) : ""),
    sortValue: (q) => q.supports,
    align: "right",
    numeric: true,
    nowrap: true,
    muted: true,
  },
];

const EVENT_COLUMNS: UIDataTableColumn<LearningEvent>[] = [
  {
    key: "ts",
    header: "Date & time",
    render: (e) => localTime(e.ts),
    // Sorted on the ISO string, not the rendered text — "17 Aug" sorts wrongly.
    sortValue: (e) => e.ts,
    numeric: true,
    nowrap: true,
    muted: true,
  },
  {
    key: "skill",
    header: "Skill",
    render: (e) => e.skillId,
    sortValue: (e) => e.skillId,
    nowrap: true,
  },
  {
    key: "lesson",
    header: "Lesson",
    render: (e) => `${e.levelNumber ? `L${e.levelNumber} ` : ""}${e.lessonId}`,
    sortValue: (e) => e.levelNumber ?? 0,
    nowrap: true,
    muted: true,
  },
  {
    key: "concept",
    header: "Concept",
    render: (e) => e.conceptKey,
    sortValue: (e) => e.conceptKey,
    nowrap: true,
    muted: true,
  },
  {
    key: "type",
    header: "Event",
    render: (e) => e.type,
    sortValue: (e) => e.type,
    nowrap: true,
  },
  { key: "detail", header: "Detail", render: describe },
  {
    key: "seq",
    header: "#",
    render: (e) => e.seq,
    sortValue: (e) => e.seq,
    align: "right",
    numeric: true,
    nowrap: true,
    muted: true,
  },
];

export const LearningLogPanel: React.FC = () => {
  // The store already notifies on every write, so the panel stays live while a
  // round is played in another tab or previewed here.
  const version = useSyncExternalStore(
    (cb) => LearningLog.subscribe(cb),
    () => LearningLog.all().length,
  );
  const [showEvents, setShowEvents] = useState(false);
  /** Two-step delete. A child's whole record is behind this button, so it takes
   *  a deliberate second click rather than a dialog anyone dismisses on reflex. */
  const [confirmClear, setConfirmClear] = useState(false);
  /** Filter by skill. One skill today, but the log is cross-skill by design. */
  const [skillFilter, setSkillFilter] = useState<string>("all");

  const { mastery, events, questions, skillUsage } = useMemo(
    () => ({
      mastery: getAllMastery(),
      events: [...LearningLog.all()].reverse(),
      questions: getQuestionRecords(),
      skillUsage: LearningLog.skillUsage(),
    }),
    // `version` is the store's change signal, not an unused value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const skills = [...new Set(events.map((e) => e.skillId))].sort();
  const shown = skillFilter === "all" ? events : events.filter((e) => e.skillId === skillFilter);
  const shownQuestions =
    skillFilter === "all" ? questions : questions.filter((q) => q.skillId === skillFilter);

  const answered = events.filter((e) => e.type === "answer_submitted").length;
  const rounds = events.filter((e) => e.type === "lesson_completed").length;
  const sessions = new Set(events.map((e) => e.sessionId)).size;

  const download = () => {
    const blob = new Blob([JSON.stringify(LearningLog.exportBatch("1.0.0"), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `koda-learning-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (events.length === 0) {
    return (
      <div className={themeSystem.card("default", "p-6 text-center")}>
        <p className="text-sm font-bold text-slate-900 dark:text-white">Nothing logged yet</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Play a round from Learn. Teacher previews are deliberately not recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UIStatGrid>
        <UIStatTile icon={<CheckCircle2 />} value={String(answered)} label="Answers" />
        <UIStatTile icon={<FlagTriangleRight />} value={String(rounds)} label="Rounds finished" />
        <UIStatTile icon={<CalendarDays />} value={String(sessions)} label="Sessions" />
        <UIStatTile
          icon={<Brain />}
          value={String(mastery.filter((m) => m.status === "mastered").length)}
          label="Concepts mastered"
          tone="success"
        />
      </UIStatGrid>

      <div className="grid gap-3 sm:grid-cols-2">
        {mastery.map((m) => (
          <ConceptCard key={m.conceptKey} mastery={m} />
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skill usage</h3>
        <UIDataTable
          columns={SKILL_COLUMNS}
          rows={skillUsage}
          rowKey={(s) => s.skillId}
          defaultSort={{ key: "plays", direction: "desc" }}
          caption="How much each skill is played, and how it goes"
          emptyMessage="No skill has been played yet."
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          One learner on this device. Counting distinct users per skill is a
          server-side roll-up over <code className="font-mono">learnerId</code>.
        </p>
      </div>

      {/* The reading grain: one row per question. The event stream below is the
          recording grain, kept for debugging rather than for answering
          "how is this child doing?". */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Questions</h3>
          {skills.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {["all", ...skills].map((id) => (
                <button
                  key={id}
                  onClick={() => setSkillFilter(id)}
                  className={themeSystem.button(skillFilter === id ? "primary" : "secondary", "sm")}
                >
                  {id === "all" ? "All skills" : id}
                </button>
              ))}
            </div>
          )}
        </div>

        <UIDataTable
          columns={QUESTION_COLUMNS}
          rows={shownQuestions}
          rowKey={(q) => q.questionId}
          defaultSort={{ key: "askedAt", direction: "desc" }}
          maxHeight="28rem"
          caption="Every question asked, with the answer given and the time taken"
          emptyMessage="No questions recorded for this skill."
        />
      </div>

      <div className={themeSystem.card("default", "overflow-hidden")}>
        <button
          onClick={() => {
            playSound("pop");
            setShowEvents((v) => !v);
          }}
          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
          aria-expanded={showEvents}
        >
          {showEvents ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
          <span className="text-sm font-bold text-slate-900 dark:text-white flex-1">
            Raw events
            <span className="font-normal text-slate-500 dark:text-slate-400">
              {" "}— what gets sent to the backend
            </span>
          </span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {shown.length}
          </span>
        </button>

        {showEvents && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-3">
            <UIDataTable
              columns={EVENT_COLUMNS}
              rows={shown.slice(0, 300)}
              rowKey={(e) => e.id}
              defaultSort={{ key: "ts", direction: "desc" }}
              maxHeight="24rem"
              caption="Every recorded learning event, newest first"
              emptyMessage="No events for this skill."
            />
          </div>
        )}
      </div>

      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
        learner <span className="text-slate-700 dark:text-slate-300">{learnerId}</span> · schema v1
        · build {APP_VERSION} · UTC{new Date().getTimezoneOffset() > 0 ? "-" : "+"}
        {Math.abs(new Date().getTimezoneOffset() / 60)}
      </p>

      <div className="flex flex-wrap gap-2">
        <button onClick={download} className={themeSystem.button("secondary", "sm")}>
          <Download />
          Export JSON
        </button>
        {confirmClear ? (
          <>
            <button
              onClick={() => {
                LearningLog.clear();
                setConfirmClear(false);
              }}
              className={themeSystem.button("danger", "sm")}
            >
              <Trash2 />
              Erase everything
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className={themeSystem.button("secondary", "sm")}
            >
              Cancel
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 self-center">
              Wipes every event and all mastery. Cannot be undone.
            </span>
          </>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className={themeSystem.button("secondary", "sm")}
          >
            <Trash2 />
            Clear log
          </button>
        )}
      </div>
    </div>
  );
};
