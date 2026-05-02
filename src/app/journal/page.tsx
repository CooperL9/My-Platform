"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppTheme } from "../theme";
import {
  getHomeStyleClasses,
  loadHomeSpace,
  type HomeSpace,
} from "../homeSpace";

type JournalEntry = {
  id: number;
  title: string;
  text: string;
  day: number;
  month: string;
  fullDate: string;
  mood: string;
  prompt: string;
};

type UserAccount = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
};

const navLinks = [
  { href: "/home", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/mood", label: "Mood" },
  { href: "/planner", label: "Planner" },
];

const journalPrompts = [
  "What is something small that would make today feel softer?",
  "What do you need to hear from yourself right now?",
  "What are you ready to release from this week?",
  "Where did you notice a little bit of beauty today?",
  "What is one thing you are proud of, even quietly?",
  "What would support your peace today?",
  "What feeling is asking for your attention?",
];

const fontFamilies: Record<string, string> = {
  Inter: "Inter, Helvetica, Arial, sans-serif",
  Helvetica: "Helvetica, Arial, sans-serif",
  Georgia: "Georgia, 'Times New Roman', serif",
  "Playfair Display": "'Playfair Display', Didot, Georgia, serif",
  Cormorant: "Cormorant, 'Palatino Linotype', Palatino, Georgia, serif",
  "Times New Roman": "'Times New Roman', Times, serif",
  Impact: "Impact, 'Arial Black', sans-serif",
  "Bebas Neue": "'Bebas Neue', 'Arial Narrow', 'Helvetica Neue', sans-serif",
  "Permanent Marker": "'Permanent Marker', 'Comic Sans MS', cursive",
  Fredoka: "Fredoka, 'Arial Rounded MT Bold', 'Trebuchet MS', sans-serif",
};

const journalVisuals = {
  "earth-tones": {
    notebook:
      "border-[#9e8d66]/70 bg-[#fff7e3] shadow-[0_26px_70px_rgba(61,72,42,0.20)]",
    paper: "border-[#b9ad87]/70 bg-[#fff9e9]",
    prompt: "border-[#a99a72]/55 bg-[#eadcc0]/78",
    tape: "bg-[#d5c69d]/80",
    binding: "bg-[#5f764f]/65",
    margin: "#879b68",
    line: "rgba(95,118,79,0.20)",
    text: "text-[#31402f]",
    muted: "text-[#6f705b]",
    doodles: ["🌿", "✿", "🦋"],
    stamp: "Botanical note",
  },
  y2k: {
    notebook:
      "border-[#b9c8ff]/80 bg-white/82 shadow-[0_26px_70px_rgba(111,93,188,0.24)] backdrop-blur",
    paper: "border-[#c8d5ff] bg-[#fbf8ff]",
    prompt: "border-[#b9c8ff]/80 bg-[#f4f0ff]/88",
    tape: "bg-gradient-to-r from-[#ffb7ef]/80 via-white/80 to-[#a8c7ff]/80",
    binding: "bg-[#7c68d8]/70",
    margin: "#f0a5ff",
    line: "rgba(124,104,216,0.20)",
    text: "text-[#342c62]",
    muted: "text-[#71669a]",
    doodles: ["💿", "✧", "⭐"],
    stamp: "Dear internet",
  },
  mature: {
    notebook:
      "rounded-xl border-[#2b2622]/20 bg-[#fffdf8] shadow-[0_26px_70px_rgba(45,38,33,0.14)]",
    paper: "rounded-xl border-[#2b2622]/15 bg-[#fffdf8]",
    prompt: "rounded-xl border-[#2b2622]/15 bg-[#f7f1e8]/90",
    tape: "bg-[#2b2622]/85",
    binding: "bg-[#2b2622]/75",
    margin: "#2b2622",
    line: "rgba(43,38,34,0.16)",
    text: "text-[#2b2622]",
    muted: "text-[#776b60]",
    doodles: ["◒", "✦", "NOIR"],
    stamp: "Private pages",
  },
  red: {
    notebook:
      "border-[#b91c1c]/30 bg-[#fff7ef] shadow-[0_26px_70px_rgba(127,29,29,0.24)]",
    paper: "border-[#e6aaa0] bg-[#fffaf5]",
    prompt: "border-[#b91c1c]/25 bg-[#ffe1dc]/80",
    tape: "bg-[#a31818]/85",
    binding: "bg-[#a31818]/75",
    margin: "#a31818",
    line: "rgba(163,24,24,0.18)",
    text: "text-[#531111]",
    muted: "text-[#8e4a42]",
    doodles: ["🍒", "♡", "★"],
    stamp: "Dear diary",
  },
  midnight: {
    notebook:
      "border-white/10 bg-[#18181b]/92 shadow-[0_26px_70px_rgba(0,0,0,0.42)]",
    paper: "border-white/10 bg-[#101014]",
    prompt: "border-white/10 bg-white/10",
    tape: "bg-[#d4d4d8]/70",
    binding: "bg-[#d4d4d8]/60",
    margin: "#a1a1aa",
    line: "rgba(244,244,245,0.16)",
    text: "text-[#f5f5f4]",
    muted: "text-[#c4c4cc]",
    doodles: ["◐", "✦", "♪"],
    stamp: "Night notes",
  },
  cosmic: {
    notebook:
      "border-[#a78bfa]/25 bg-[#0f172a]/88 shadow-[0_26px_70px_rgba(15,23,42,0.44)] backdrop-blur",
    paper: "border-[#818cf8]/30 bg-[#0b1024]",
    prompt: "border-[#a78bfa]/25 bg-[#1e1b4b]/72",
    tape: "bg-gradient-to-r from-[#8b5cf6]/75 to-[#2563eb]/75",
    binding: "bg-[#c4b5fd]/65",
    margin: "#818cf8",
    line: "rgba(199,210,254,0.18)",
    text: "text-[#eef2ff]",
    muted: "text-[#c7d2fe]",
    doodles: ["🌙", "🪐", "✦"],
    stamp: "Orbit log",
  },
  playhouse: {
    notebook:
      "border-[#202020]/20 bg-white shadow-[0_24px_62px_rgba(43,43,43,0.18)]",
    paper: "border-[#202020]/18 bg-white",
    prompt: "border-[#202020]/18 bg-[#fff7d6]",
    tape: "bg-[#fde68a]",
    binding: "bg-[#2563eb]/75",
    margin: "#f97316",
    line: "rgba(37,99,235,0.18)",
    text: "text-[#202020]",
    muted: "text-[#514b43]",
    doodles: ["🙂", "◆", "✿"],
    stamp: "",
  },
};

export default function JournalPage() {
  const router = useRouter();
  const { activeTheme } = useAppTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [journalMode, setJournalMode] = useState<"prompt" | "free">("prompt");
  const [customTitle, setCustomTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [homeSpace, setHomeSpace] = useState<HomeSpace | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayDate = today.toLocaleDateString();
  const promptIndex =
    Math.floor(today.getTime() / 86400000) % journalPrompts.length;
  const todaysPrompt = journalPrompts[promptIndex];

  const todaysEntry = savedEntries.find((item) => item.fullDate === todayDate);

  useEffect(() => {
    const loadUserEntries = () => {
      const storedUser = localStorage.getItem("currentLoggedInUser");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user: UserAccount = JSON.parse(storedUser);
      const storageKey = `journalEntries_${user.email}`;
      const storedEntries = localStorage.getItem(storageKey);

      setCurrentUser(user);
      setHomeSpace(loadHomeSpace(user));

      if (!storedEntries) {
        setSavedEntries([]);
        return;
      }

      const parsedEntries = JSON.parse(storedEntries);

      const normalizedEntries = parsedEntries.map(
        (item: Partial<JournalEntry>) => ({
          id: item.id ?? Date.now(),
          title:
            item.title && item.title.trim() !== ""
              ? item.title
              : item.prompt && item.prompt.trim() !== ""
              ? item.prompt
              : "Untitled Entry",
          text: item.text ?? "",
          day: item.day ?? new Date().getDate(),
          month:
            item.month ??
            new Date().toLocaleString("default", { month: "long" }),
          fullDate: item.fullDate ?? new Date().toLocaleDateString(),
          mood: item.mood ?? "",
          prompt: item.prompt ?? "",
        })
      );

      setSavedEntries(normalizedEntries);
    };

    const timeoutId = window.setTimeout(loadUserEntries, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("currentLoggedInUser");
    router.push("/login");
  };

  const saveEntries = (updatedEntries: JournalEntry[]) => {
    if (!currentUser) return;

    setSavedEntries(updatedEntries);
    localStorage.setItem(
      `journalEntries_${currentUser.email}`,
      JSON.stringify(updatedEntries)
    );
  };

  const createOrReplaceTodayEntry = () => {
    if (!entry.trim()) return;
    if (journalMode === "free" && !customTitle.trim()) return;

    const day = today.getDate();
    const month = today.toLocaleString("default", { month: "long" });
    const fullDate = today.toLocaleDateString();
    const title =
      journalMode === "prompt" ? todaysPrompt : customTitle.trim();

    const newEntry: JournalEntry = {
      id: todaysEntry ? todaysEntry.id : Date.now(),
      title,
      text: entry,
      day,
      month,
      fullDate,
      mood: "",
      prompt: journalMode === "prompt" ? todaysPrompt : "",
    };

    let updatedEntries: JournalEntry[];

    if (todaysEntry) {
      updatedEntries = savedEntries.map((item) =>
        item.fullDate === fullDate ? newEntry : item
      );
    } else {
      updatedEntries = [newEntry, ...savedEntries];
    }

    saveEntries(updatedEntries);
    setCustomTitle("");
    setEntry("");
    setShowWarning(false);
  };

  const handleSaveClick = () => {
    if (!entry.trim()) return;
    if (journalMode === "free" && !customTitle.trim()) return;

    if (todaysEntry) {
      setShowWarning(true);
      return;
    }

    createOrReplaceTodayEntry();
  };

  const { cardClassName, titleClassName, highlightClassName } =
    getHomeStyleClasses(
      activeTheme,
      homeSpace?.widgetStyle,
      homeSpace?.colorPalette
    );
  const featureFontFamily = homeSpace
    ? fontFamilies[homeSpace.fontVibe] ?? fontFamilies.Inter
    : fontFamilies.Inter;
  const needsLightSupportingText =
    activeTheme.value === "midnight" ||
    activeTheme.value === "cosmic" ||
    homeSpace?.colorPalette === "charcoal";
  const labelTextClassName = needsLightSupportingText
    ? "text-white/85"
    : activeTheme.accent;
  const supportTextClassName = needsLightSupportingText
    ? "text-zinc-100/80"
    : activeTheme.mutedText;
  const panelClassName = needsLightSupportingText
    ? "border-white/15 bg-white/10 text-zinc-100/80"
    : `${activeTheme.border} ${activeTheme.surfaceAlt} ${activeTheme.mutedText}`;
  const selectedModeClassName = `${activeTheme.primaryButton}`;
  const unselectedModeClassName = needsLightSupportingText
    ? "text-zinc-100/75 hover:bg-white/10"
    : `${activeTheme.mutedText} hover:bg-white/45`;
  const journalVisual = journalVisuals[activeTheme.value];
  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`relative min-h-screen px-5 py-6 sm:px-6 sm:py-8 ${activeTheme.background} ${activeTheme.pattern} ${activeTheme.text}`}>
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="relative mb-5 flex justify-end">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-xl shadow-sm transition ${activeTheme.secondaryButton}`}
            aria-label="Open navigation menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>

          {menuOpen && (
            <div className={`absolute right-0 top-14 z-30 w-44 rounded-3xl p-3 ${activeTheme.menu}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium ${activeTheme.menuItem}`}
                >
                  {link.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleLogout}
                className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium ${activeTheme.menuItem}`}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <section className={`mb-4 overflow-hidden p-5 sm:p-6 ${cardClassName}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.24em] ${labelTextClassName}`}>
                Private entry
              </p>
              <h1
                className={`text-4xl font-semibold leading-none sm:text-6xl ${titleClassName}`}
                style={{ fontFamily: featureFontFamily }}
              >
                Journal
              </h1>
              <p className={`mt-3 max-w-md text-sm leading-6 ${supportTextClassName}`}>
                Open your page for whatever feels true, tender, unfinished, or
                ready to become real.
              </p>
            </div>

            <Link
              href="/history"
              className={`inline-flex rounded-full px-5 py-3 text-sm font-medium ${activeTheme.secondaryButton}`}
            >
              View Past Entries
            </Link>
          </div>
        </section>

        <div className={`relative overflow-hidden rounded-[2rem] border p-4 sm:p-5 ${journalVisual.notebook}`}>
          <div className={`absolute left-8 top-0 h-8 w-28 -rotate-3 rounded-b-md opacity-80 ${journalVisual.tape}`} />
          {journalVisual.stamp && (
            <div className={`absolute right-10 top-4 hidden rotate-6 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide sm:block ${highlightClassName}`}>
              {journalVisual.stamp}
            </div>
          )}
          <div className="pointer-events-none absolute left-3 top-20 hidden flex-col gap-4 lg:flex">
            {[0, 1, 2, 3, 4, 5].map((ring) => (
              <span
                key={ring}
                className={`h-3 w-8 rounded-full ${journalVisual.binding}`}
              />
            ))}
          </div>

          {todaysEntry && !showWarning && (
            <div className={`mb-4 rounded-3xl border p-4 ${panelClassName}`}>
              <p className="text-sm font-medium">
                You already completed your entry for today.
              </p>
              <p className="mt-1 text-sm">
                If you save a new one, it will replace the current entry.
              </p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[0.74fr_1.26fr] lg:pl-8">
            <section className={`relative overflow-hidden rounded-[1.5rem] border p-4 ${journalVisual.prompt} ${journalVisual.muted}`}>
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full border border-current/10 opacity-40" />
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className={`text-sm font-semibold ${labelTextClassName}`}>
                  Today&apos;s Prompt
                </p>
                <span className={`rounded-full px-3 py-1 text-xs ${highlightClassName}`}>
                  {journalVisual.doodles[0]}
                </span>
              </div>

              <div className={`mb-4 grid grid-cols-2 rounded-full border p-1 ${needsLightSupportingText ? "border-white/15 bg-white/10" : `${activeTheme.border} bg-white/55`}`}>
                <button
                  type="button"
                  onClick={() => setJournalMode("prompt")}
                  className={`rounded-full py-2.5 text-sm font-medium transition ${
                    journalMode === "prompt"
                      ? selectedModeClassName
                      : unselectedModeClassName
                  }`}
                >
                  Daily Prompt
                </button>

                <button
                  type="button"
                  onClick={() => setJournalMode("free")}
                  className={`rounded-full py-2.5 text-sm font-medium transition ${
                    journalMode === "free"
                      ? selectedModeClassName
                      : unselectedModeClassName
                  }`}
                >
                  Free Write
                </button>
              </div>

              <p
                className={`rounded-[1.25rem] border p-4 text-sm leading-relaxed ${needsLightSupportingText ? "border-white/15 bg-black/15 text-zinc-100/85" : `${activeTheme.border} bg-white/65 ${activeTheme.mutedText}`}`}
                style={{ fontFamily: featureFontFamily }}
              >
                {journalMode === "prompt"
                  ? todaysPrompt
                  : "Write whatever is on your mind today."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-lg opacity-80">
                {journalVisual.doodles.map((doodle) => (
                  <span key={doodle}>{doodle}</span>
                ))}
              </div>

              <div className={`mt-5 rounded-2xl border p-3 text-xs leading-5 ${needsLightSupportingText ? "border-white/15 bg-white/10 text-zinc-100/75" : `${activeTheme.border} bg-white/55 ${activeTheme.mutedText}`}`}>
                <p className="font-semibold uppercase tracking-wide">
                  Today
                </p>
                <p>{todayLabel}</p>
              </div>
            </section>

            <section className={`relative overflow-hidden rounded-[1.5rem] border ${journalVisual.paper}`}>
              <div className="flex items-center justify-between gap-3 border-b border-current/10 px-5 py-3">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${journalVisual.muted}`}>
                    Notebook page
                  </p>
                  <p
                    className={`text-lg font-semibold ${journalVisual.text}`}
                    style={{ fontFamily: featureFontFamily }}
                  >
                    {journalMode === "prompt" ? "Daily Prompt" : "Free Write"}
                  </p>
                </div>
                <span className={`hidden max-w-[12rem] truncate rounded-full px-3 py-1 text-xs sm:inline-flex ${highlightClassName}`}>
                  {todayLabel}
                </span>
              </div>

              <div className="relative p-4">
                <div className={`absolute left-8 top-0 hidden h-full w-px opacity-50 sm:block ${journalVisual.binding}`} />
                {journalMode === "free" && (
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Journal title"
                    className={`mb-4 w-full rounded-[1.25rem] border px-4 py-3 text-sm shadow-[inset_0_1px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 ${activeTheme.input}`}
                  />
                )}

                <textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className={`h-[28rem] w-full resize-none rounded-[1.25rem] border-0 bg-transparent px-5 py-4 pl-12 text-sm leading-8 outline-none placeholder:opacity-60 focus:ring-0 sm:text-base ${journalVisual.text}`}
                  style={{
                    backgroundImage: `linear-gradient(90deg, transparent 0, transparent 3.25rem, ${journalVisual.margin} 3.25rem, ${journalVisual.margin} calc(3.25rem + 1px), transparent calc(3.25rem + 1px)), repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, ${journalVisual.line} 32px)`,
                    backgroundSize: "100% 32px",
                    fontFamily: featureFontFamily,
                  }}
                />

                {!showWarning ? (
                  <button
                    onClick={handleSaveClick}
                    className={`mt-4 w-full rounded-full py-3.5 text-sm font-medium ${activeTheme.primaryButton}`}
                  >
                    Save Entry
                  </button>
                ) : (
                  <div className={`mt-4 rounded-3xl border p-4 ${panelClassName}`}>
                    <p className="mb-3 text-sm font-medium">
                      You have already completed your entry for today.
                    </p>
                    <p className="mb-4 text-sm">
                      If you continue, your old entry will be deleted and
                      replaced with this one.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowWarning(false)}
                        className={`w-1/2 rounded-full py-3 text-sm font-medium ${activeTheme.secondaryButton}`}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={createOrReplaceTodayEntry}
                        className={`w-1/2 rounded-full py-3 text-sm font-medium ${activeTheme.primaryButton}`}
                      >
                        Replace Entry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
