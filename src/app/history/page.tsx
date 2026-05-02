"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ui } from "../stylePatterns";

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedText, setEditedText] = useState("");

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

  return (
    <div className={ui.page}>
      <div className={ui.shell}>
        <div className="relative mb-7 flex justify-end">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={ui.menuButton}
          >
            {menuOpen ? "×" : "☰"}
          </button>

          {menuOpen && (
            <div className={ui.menu}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={ui.menuItem}
                >
                  {link.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleLogout}
                className={`${ui.menuItem} w-full text-left`}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <p className={ui.eyebrow}>
            Past pages
          </p>
          <h1 className={ui.title}>
            Journal History
          </h1>
        </div>

        {selectedEntry ? (
          <div className={ui.card}>
            <button
              onClick={() => {
                setSelectedEntry(null);
                handleCancelEdit();
              }}
              className={`${ui.secondaryButton} mb-5 px-4 py-2 text-sm`}
            >
              Back to entries
            </button>

            {editingId === selectedEntry.id ? (
              <>
                <input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={`${ui.input} mb-3 p-4`}
                />

                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className={`${ui.textarea} min-h-[220px] rounded-[1.5rem]`}
                />

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className={`${ui.secondaryButton} w-1/2 py-3`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleSaveEdit(selectedEntry.id)}
                    className={`${ui.primaryButton} w-1/2 py-3`}
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm text-[#b59b91]">
                  {selectedEntry.fullDate}
                </p>

                <h2 className="mb-5 text-2xl font-semibold leading-snug text-[#5c4033]">
                  {selectedEntry.title}
                </h2>

                {selectedEntry.prompt && (
                  <div className={`${ui.paper} mb-5 bg-[#fff7f3]`}>
                    <p className="mb-1 text-xs font-medium uppercase text-[#b07d62]">
                      Prompt
                    </p>
                    <p className="text-sm text-[#8b6f65]">
                      {selectedEntry.prompt}
                    </p>
                  </div>
                )}

                <p className="mb-6 whitespace-pre-wrap rounded-[1.5rem] bg-[#fffaf8] p-5 leading-7 text-[#5c4033]">
                  {selectedEntry.text}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditClick(selectedEntry)}
                    className={`${ui.primaryButton} w-1/2 py-3`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteEntry(selectedEntry.id)}
                    className={`${ui.secondaryButton} w-1/2 py-3`}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ) : savedEntries.length === 0 ? (
          <p className={ui.empty}>
            No entries yet.
          </p>
        ) : (
          Object.entries(groupedEntries).map(([month, entries]) => (
            <div key={month} className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-[#7c5c52]">
                {month}
              </h2>

              <div className="space-y-4">
                {entries.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEntry(item)}
                    className={ui.listItem}
                  >
                    <p className="mb-2 text-sm text-[#b59b91]">
                      {item.fullDate}
                    </p>

                    <h3 className="text-lg font-semibold text-[#6f4e43]">
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
