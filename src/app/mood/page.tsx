"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppTheme } from "../theme";
import {
  getHomeStyleClasses,
  loadHomeSpace,
  type HomeSpace,
} from "../homeSpace";

type UserAccount = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
};

type MoodEntry = {
  id: number;
  mood: string;
  emoji: string;
  note: string;
  date: string;
};

const navLinks = [
  { href: "/home", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/mood", label: "Mood" },
  { href: "/planner", label: "Planner" },
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

const moodThemeDetails = {
  "earth-tones": {
    aura: "from-[#dfe8cf]/75 via-[#fff8e8]/85 to-[#eadcc0]/80",
    noteLine: "rgba(95,118,79,0.18)",
    doodles: ["🌿", "✿", "🦋"],
  },
  y2k: {
    aura: "from-[#f7d8ff]/75 via-white/85 to-[#dbeafe]/85",
    noteLine: "rgba(124,104,216,0.20)",
    doodles: ["💿", "✧", "⭐"],
  },
  mature: {
    aura: "from-[#fffdf8]/90 via-[#f7f1e8]/88 to-[#e7ded2]/80",
    noteLine: "rgba(43,38,34,0.15)",
    doodles: ["◒", "✦"],
  },
  red: {
    aura: "from-[#ffe1dc]/80 via-[#fff7ef]/88 to-[#f3c1b8]/55",
    noteLine: "rgba(163,24,24,0.18)",
    doodles: ["🍒", "♡", "★"],
  },
  midnight: {
    aura: "from-[#27272a]/90 via-[#18181b]/92 to-[#09090b]/92",
    noteLine: "rgba(244,244,245,0.16)",
    doodles: ["◐", "✦", "♪"],
  },
  cosmic: {
    aura: "from-[#312e81]/80 via-[#0f172a]/90 to-[#020617]/90",
    noteLine: "rgba(199,210,254,0.18)",
    doodles: ["🌙", "🪐", "✦"],
  },
  playhouse: {
    aura: "from-white via-[#fff7d6] to-[#bfdbfe]/78",
    noteLine: "rgba(37,99,235,0.18)",
    doodles: ["🙂", "◆", "✿"],
  },
};

export default function MoodPage() {
  return (
    <Suspense fallback={null}>
      <MoodContent />
    </Suspense>
  );
}

function MoodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeTheme } = useAppTheme();
  const selectedFromUrl = searchParams.get("selected");

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [selectedMood, setSelectedMood] = useState(selectedFromUrl || "");
  const [moodNote, setMoodNote] = useState("");
  const [savedMoods, setSavedMoods] = useState<MoodEntry[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<MoodEntry | null>(
    null
  );
  const [editingMoodId, setEditingMoodId] = useState<number | null>(null);
  const [editedMoodNote, setEditedMoodNote] = useState("");
  const [homeSpace, setHomeSpace] = useState<HomeSpace | null>(null);

  const moodMap: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    neutral: "😐",
    angry: "😠",
    overwhelmed: "😩",
  };

  useEffect(() => {
    const loadUserMoods = () => {
      const storedUser = localStorage.getItem("currentLoggedInUser");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user: UserAccount = JSON.parse(storedUser);
      const stored = localStorage.getItem(`moodEntries_${user.email}`);

      setCurrentUser(user);
      setHomeSpace(loadHomeSpace(user));

      if (stored) {
        setSavedMoods(JSON.parse(stored));
      }
    };

    const timeoutId = window.setTimeout(loadUserMoods, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("currentLoggedInUser");
    router.push("/login");
  };

  const saveMoods = (updatedMoods: MoodEntry[]) => {
    if (!currentUser) return;

    setSavedMoods(updatedMoods);
    localStorage.setItem(
      `moodEntries_${currentUser.email}`,
      JSON.stringify(updatedMoods)
    );
  };

  useEffect(() => {
    const updateSelectedMood = () => {
      if (selectedFromUrl) {
        setSelectedMood(selectedFromUrl);
      }
    };

    const timeoutId = window.setTimeout(updateSelectedMood, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedFromUrl]);

  const handleSave = () => {
    if (!currentUser) return;
    if (!selectedMood || moodNote.trim() === "") return;

    const today = new Date().toDateString();

    const existingEntryToday = savedMoods.find(
      (entry) => new Date(entry.date).toDateString() === today
    );

    if (existingEntryToday) {
      const confirmReplace = window.confirm(
        "You already completed your mood check-in for today. Continuing will replace today's entry."
      );

      if (!confirmReplace) {
        return;
      }
    }

    const newEntry = {
      id: Date.now(),
      mood: selectedMood,
      emoji: moodMap[selectedMood],
      note: moodNote,
      date: new Date().toISOString(),
    };

    const filteredEntries = savedMoods.filter(
      (entry) => new Date(entry.date).toDateString() !== today
    );

    const updated = [newEntry, ...filteredEntries];

    saveMoods(updated);

    setMoodNote("");
    setSelectedHistory(null);
  };

  const handleEditMood = (entry: MoodEntry) => {
    setEditingMoodId(entry.id);
    setEditedMoodNote(entry.note);
  };

  const handleSaveMoodEdit = (id: number) => {
    if (editedMoodNote.trim() === "") return;

    const updatedMoods = savedMoods.map((entry) =>
      entry.id === id ? { ...entry, note: editedMoodNote } : entry
    );

    saveMoods(updatedMoods);
    setSelectedHistory(
      updatedMoods.find((entry) => entry.id === id) ?? selectedHistory
    );
    setEditingMoodId(null);
    setEditedMoodNote("");
  };

  const handleDeleteMood = (id: number) => {
    const updatedMoods = savedMoods.filter((entry) => entry.id !== id);

    saveMoods(updatedMoods);
    setSelectedHistory(null);
    setEditingMoodId(null);
    setEditedMoodNote("");
  };

  const { cardClassName, titleClassName, highlightClassName } =
    getHomeStyleClasses(
      activeTheme,
      homeSpace?.widgetStyle,
      homeSpace?.colorPalette
    );
  const moodVisual = moodThemeDetails[activeTheme.value];
  const featureFontFamily = homeSpace
    ? fontFamilies[homeSpace.fontVibe] ?? fontFamilies.Inter
    : fontFamilies.Inter;
  const needsLightSupportingText =
    activeTheme.value === "midnight" ||
    activeTheme.value === "cosmic" ||
    homeSpace?.colorPalette === "charcoal";
  const pageOverlayClassName = needsLightSupportingText
    ? "bg-black/35 backdrop-blur-[1px]"
    : "bg-[#fffaf2]/45 backdrop-blur-[1px]";
  const labelTextClassName = needsLightSupportingText
    ? "text-zinc-100/80"
    : activeTheme.accent;
  const supportTextClassName = needsLightSupportingText
    ? "text-zinc-100/75"
    : activeTheme.mutedText;
  const softSurfaceClassName = needsLightSupportingText
    ? "border-white/10 bg-white/10 text-zinc-100/80"
    : `${activeTheme.border} ${activeTheme.surfaceAlt} ${activeTheme.mutedText}`;
  const entryCardClassName = needsLightSupportingText
    ? "border-white/10 bg-white/10 text-zinc-100 shadow-[0_14px_34px_rgba(0,0,0,0.28)] hover:bg-white/15"
    : "border-white/80 bg-white/95 text-[#2f2924] shadow-[0_14px_34px_rgba(65,50,40,0.10)] hover:bg-white";

  return (
    <main className={`relative min-h-screen overflow-hidden px-5 py-8 sm:px-6 sm:py-10 ${activeTheme.background} ${activeTheme.pattern} ${activeTheme.text}`}>
      <div className={`pointer-events-none absolute inset-0 ${pageOverlayClassName}`} />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="relative mb-7 flex justify-end">
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

        <section className={`mb-6 overflow-hidden p-5 text-center sm:p-7 ${cardClassName}`}>
          <div className="mx-auto mb-4 flex w-fit gap-2 text-lg opacity-85">
            {moodVisual.doodles.map((doodle) => (
              <span key={doodle}>{doodle}</span>
            ))}
          </div>
          <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.24em] ${labelTextClassName}`}>
            Daily check-in
          </p>
          <h1
            className={`text-4xl font-semibold leading-none sm:text-6xl ${titleClassName}`}
            style={{ fontFamily: featureFontFamily }}
          >
            Mood
          </h1>
          <p className={`mx-auto mt-3 max-w-sm text-sm leading-6 ${supportTextClassName}`}>
            Name what you feel and leave yourself a soft note.
          </p>
        </section>

        <section className={`mx-auto mb-6 max-w-2xl overflow-hidden rounded-[2rem] border bg-gradient-to-br p-5 shadow-[0_24px_62px_rgba(40,30,30,0.16)] sm:p-7 ${activeTheme.border} ${moodVisual.aura}`}>
          <div className="mb-5 text-center">
            <p className={`text-sm font-semibold ${labelTextClassName}`}>
              How are you feeling?
            </p>
          </div>

          <div className="mb-5 flex flex-wrap justify-center gap-3">
            {Object.entries(moodMap).map(([key, emoji]) => {
              const isSelected = selectedMood === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMood(key)}
                  className={`flex h-14 w-14 items-center justify-center rounded-full border text-3xl transition ${
                    isSelected
                      ? `scale-105 ${highlightClassName} shadow-[0_0_0_6px_rgba(255,255,255,0.35),0_18px_34px_rgba(50,35,35,0.18)]`
                      : `${softSurfaceClassName} shadow-sm hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(50,35,35,0.12)]`
                  }`}
                  aria-label={`Select ${key}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          {selectedMood && (
            <p className={`mx-auto mb-4 w-fit rounded-full px-4 py-2 text-center text-sm font-medium ${highlightClassName}`}>
              {moodMap[selectedMood]} {selectedMood}
            </p>
          )}

          <textarea
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            placeholder="What is this feeling trying to tell you?"
            className={`h-44 w-full resize-none rounded-[1.5rem] border p-5 leading-7 shadow-[inset_0_2px_12px_rgba(0,0,0,0.05)] outline-none placeholder:opacity-65 focus:ring-2 ${activeTheme.input}`}
            style={{
              backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, ${moodVisual.noteLine} 32px)`,
              backgroundSize: "100% 32px",
            }}
          />

          <button
            type="button"
            onClick={handleSave}
            className={`mt-5 w-full rounded-full py-3.5 text-sm font-medium ${activeTheme.primaryButton}`}
          >
            Save Mood
          </button>
        </section>

        <section className={`rounded-[2rem] border p-5 sm:p-7 ${cardClassName}`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className={`text-xl font-semibold ${titleClassName}`}>
              Previous Moods
            </h2>
            <span className={`rounded-full px-3 py-1 text-xs ${highlightClassName}`}>
              ✦
            </span>
          </div>

          {savedMoods.length === 0 ? (
            <p className={`rounded-[1.5rem] border p-5 text-center text-sm ${softSurfaceClassName}`}>
              No moods saved yet.
            </p>
          ) : (
            <>
              {Object.entries(
                savedMoods.reduce<Record<string, MoodEntry[]>>((acc, entry) => {
                  const date = new Date(entry.date);

                  const monthKey = date.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  });

                  if (!acc[monthKey]) {
                    acc[monthKey] = [];
                  }

                  acc[monthKey].push(entry);

                  return acc;
                }, {})
              ).map(([month, entries]) => (
                <div key={month} className="mb-6">
                  <h3 className={`mb-3 text-sm font-semibold ${labelTextClassName}`}>
                    {month}
                  </h3>

                  <div className="grid grid-cols-7 gap-2">
                    {entries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => setSelectedHistory(entry)}
                        className={`rounded-2xl border p-2 text-center transition ${entryCardClassName}`}
                      >
                        <div className="text-lg">{entry.emoji}</div>
                        <div className={`text-[10px] ${supportTextClassName}`}>
                          {new Date(entry.date).getDate()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {selectedHistory && (
                <div className={`mt-5 rounded-[1.75rem] border p-5 ${softSurfaceClassName}`}>
                  <p className={`mb-2 text-sm ${supportTextClassName}`}>
                    {new Date(selectedHistory.date).toLocaleDateString(
                      undefined,
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>

                  <p className={`mb-3 text-lg font-semibold ${titleClassName}`}>
                    {selectedHistory.emoji} {selectedHistory.mood}
                  </p>

                  {editingMoodId === selectedHistory.id ? (
                    <>
                      <textarea
                        value={editedMoodNote}
                        onChange={(e) => setEditedMoodNote(e.target.value)}
                        className={`h-32 w-full resize-none rounded-[1.25rem] border p-4 text-sm leading-6 ${activeTheme.input}`}
                      />

                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={() => {
                            setEditingMoodId(null);
                            setEditedMoodNote("");
                          }}
                          className={`w-1/2 rounded-full py-2.5 text-sm font-medium ${activeTheme.secondaryButton}`}
                        >
                          Cancel
                        </button>

                        <button
                          onClick={() => handleSaveMoodEdit(selectedHistory.id)}
                          className={`w-1/2 rounded-full py-2.5 text-sm font-medium ${activeTheme.primaryButton}`}
                        >
                          Save
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={`whitespace-pre-wrap text-sm leading-6 ${supportTextClassName}`}>
                        {selectedHistory.note}
                      </p>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleEditMood(selectedHistory)}
                          className={`w-1/2 rounded-full py-2.5 text-sm font-medium ${activeTheme.primaryButton}`}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteMood(selectedHistory.id)}
                          className={`w-1/2 rounded-full py-2.5 text-sm font-medium ${activeTheme.secondaryButton}`}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
