"use client";

import React, { useEffect, useState } from "react";
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

export default function HistoryPage() {
  const router = useRouter();
  const { activeTheme } = useAppTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedText, setEditedText] = useState("");
  const [homeSpace, setHomeSpace] = useState<HomeSpace | null>(null);

  useEffect(() => {
    const loadUserEntries = () => {
      const storedUser = localStorage.getItem("currentLoggedInUser");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user: UserAccount = JSON.parse(storedUser);
      const storedEntries = localStorage.getItem(`journalEntries_${user.email}`);

      setCurrentUser(user);
      setHomeSpace(loadHomeSpace(user));

      if (storedEntries) {
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
      }
    };

    const timeoutId = window.setTimeout(loadUserEntries, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  const saveToLocalStorage = (entries: JournalEntry[]) => {
    if (!currentUser) return;

    setSavedEntries(entries);
    localStorage.setItem(
      `journalEntries_${currentUser.email}`,
      JSON.stringify(entries)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("currentLoggedInUser");
    router.push("/login");
  };

  const handleEditClick = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditedTitle(entry.title);
    setEditedText(entry.text);
  };

  const handleSaveEdit = (id: number) => {
    if (!editedTitle.trim()) return;
    if (!editedText.trim()) return;

    const updatedEntries = savedEntries.map((entry) =>
      entry.id === id
        ? { ...entry, title: editedTitle.trim(), text: editedText }
        : entry
    );

    saveToLocalStorage(updatedEntries);
    setSelectedEntry(
      updatedEntries.find((entry) => entry.id === id) ?? selectedEntry
    );
    setEditingId(null);
    setEditedTitle("");
    setEditedText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedTitle("");
    setEditedText("");
  };

  const handleDeleteEntry = (id: number) => {
    const updatedEntries = savedEntries.filter((entry) => entry.id !== id);

    saveToLocalStorage(updatedEntries);
    setSelectedEntry(null);
    setEditingId(null);
  };

  const groupedEntries = savedEntries.reduce(
    (groups: Record<string, JournalEntry[]>, item) => {
      if (!groups[item.month]) {
        groups[item.month] = [];
      }
      groups[item.month].push(item);
      return groups;
    },
    {}
  );

  const { titleClassName, highlightClassName } =
    getHomeStyleClasses(
      activeTheme,
      homeSpace?.widgetStyle,
      homeSpace?.colorPalette
    );
  const needsLightSupportingText =
    activeTheme.value === "midnight" ||
    activeTheme.value === "cosmic" ||
    homeSpace?.colorPalette === "charcoal";
  const pageOverlayClassName = needsLightSupportingText
    ? "bg-black/35 backdrop-blur-[1px]"
    : "bg-[#fffaf2]/55 backdrop-blur-[1px]";
  const archiveSurfaceClassName = needsLightSupportingText
    ? "border-white/10 bg-[#111116]/90 text-zinc-100 shadow-[0_26px_70px_rgba(0,0,0,0.38)]"
    : "border-white/70 bg-white/92 text-[#2f2924] shadow-[0_24px_60px_rgba(65,50,40,0.14)]";
  const entryCardClassName = needsLightSupportingText
    ? "border-white/10 bg-white/10 text-zinc-100 shadow-[0_18px_42px_rgba(0,0,0,0.30)] hover:bg-white/15"
    : "border-white/80 bg-white/95 text-[#2f2924] shadow-[0_16px_38px_rgba(65,50,40,0.12)] hover:bg-white";
  const mutedTextClassName = needsLightSupportingText
    ? "text-zinc-100/70"
    : activeTheme.mutedText;
  const labelTextClassName = needsLightSupportingText
    ? "text-zinc-100/80"
    : activeTheme.accent;
  const paperClassName = needsLightSupportingText
    ? "border-white/10 bg-white/10 text-zinc-100/82"
    : `${activeTheme.border} ${activeTheme.surfaceAlt} ${activeTheme.mutedText}`;

  return (
    <div className={`relative min-h-screen overflow-hidden px-5 py-8 sm:px-6 sm:py-10 ${activeTheme.background} ${activeTheme.pattern} ${activeTheme.text}`}>
      <div className={`pointer-events-none absolute inset-0 ${pageOverlayClassName}`} />
      <div className="relative z-10 mx-auto w-full max-w-4xl">
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

        <section className={`mb-5 rounded-[2rem] border p-5 sm:p-6 ${archiveSurfaceClassName}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.24em] ${labelTextClassName}`}>
                Past pages
              </p>
              <h1 className={`text-4xl font-semibold leading-none sm:text-5xl ${titleClassName}`}>
                Journal History
              </h1>
            </div>
            <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${highlightClassName}`}>
              {savedEntries.length} {savedEntries.length === 1 ? "entry" : "entries"}
            </span>
          </div>
        </section>

        {selectedEntry ? (
          <div className={`rounded-[2rem] border p-5 sm:p-7 ${archiveSurfaceClassName}`}>
            <button
              onClick={() => {
                setSelectedEntry(null);
                handleCancelEdit();
              }}
              className={`mb-5 rounded-full px-4 py-2 text-sm font-medium ${activeTheme.secondaryButton}`}
            >
              Back to entries
            </button>

            {editingId === selectedEntry.id ? (
              <>
                <input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={`mb-3 w-full rounded-[1.25rem] border px-4 py-3 ${activeTheme.input}`}
                />

                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className={`min-h-[260px] w-full resize-none rounded-[1.5rem] border p-5 leading-7 ${activeTheme.input}`}
                />

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className={`w-1/2 rounded-full py-3 text-sm font-medium ${activeTheme.secondaryButton}`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleSaveEdit(selectedEntry.id)}
                    className={`w-1/2 rounded-full py-3 text-sm font-medium ${activeTheme.primaryButton}`}
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={`mb-2 text-sm ${mutedTextClassName}`}>
                  {selectedEntry.fullDate}
                </p>

                <h2 className={`mb-5 text-2xl font-semibold leading-snug ${titleClassName}`}>
                  {selectedEntry.title}
                </h2>

                {selectedEntry.prompt && (
                  <div className={`mb-5 rounded-[1.5rem] border p-4 ${paperClassName}`}>
                    <p className={`mb-1 text-xs font-semibold uppercase tracking-wide ${labelTextClassName}`}>
                      Prompt
                    </p>
                    <p className="text-sm leading-6">
                      {selectedEntry.prompt}
                    </p>
                  </div>
                )}

                <p className={`mb-6 whitespace-pre-wrap rounded-[1.5rem] border p-5 leading-7 ${paperClassName}`}>
                  {selectedEntry.text}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditClick(selectedEntry)}
                    className={`w-1/2 rounded-full py-3 text-sm font-medium ${activeTheme.primaryButton}`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteEntry(selectedEntry.id)}
                    className={`w-1/2 rounded-full py-3 text-sm font-medium ${activeTheme.secondaryButton}`}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ) : savedEntries.length === 0 ? (
          <p className={`rounded-[2rem] border p-6 text-center text-sm ${archiveSurfaceClassName}`}>
            No entries yet.
          </p>
        ) : (
          Object.entries(groupedEntries).map(([month, entries]) => (
            <div key={month} className="mb-10">
              <h2 className={`mb-4 text-2xl font-semibold ${titleClassName}`}>
                {month}
              </h2>

              <div className="space-y-4">
                {entries.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEntry(item)}
                    className={`w-full rounded-[1.5rem] border p-5 text-left transition ${entryCardClassName}`}
                  >
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${mutedTextClassName}`}>
                      {item.fullDate}
                    </p>

                    <h3 className="text-lg font-semibold leading-snug">
                      {item.title}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
