"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadHomeSpace,
  getDefaultHomeSpace,
  getHomeStyleClasses,
  type HomeSpace,
  type UserAccount,
} from "../homeSpace";
import { themeByKey, useAppTheme } from "../theme";

type PlannerHomeItem = {
  id: number;
  title: string;
  type?: string;
  date?: string;
  time?: string;
  completed?: boolean;
};

type MoodHomeEntry = {
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

const safeJsonParse = <T,>(value: string | null, fallback: T) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getPrettyDate = (dateKey?: string) => {
  if (!dateKey) return "Any day";

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const getZodiacSign = (birthday: string) => {
  const date = new Date(`${birthday}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "";

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const zodiacDates = [
    { name: "Capricorn", symbol: "♑", start: [12, 22], end: [1, 19] },
    { name: "Aquarius", symbol: "♒", start: [1, 20], end: [2, 18] },
    { name: "Pisces", symbol: "♓", start: [2, 19], end: [3, 20] },
    { name: "Aries", symbol: "♈", start: [3, 21], end: [4, 19] },
    { name: "Taurus", symbol: "♉", start: [4, 20], end: [5, 20] },
    { name: "Gemini", symbol: "♊", start: [5, 21], end: [6, 20] },
    { name: "Cancer", symbol: "♋", start: [6, 21], end: [7, 22] },
    { name: "Leo", symbol: "♌", start: [7, 23], end: [8, 22] },
    { name: "Virgo", symbol: "♍", start: [8, 23], end: [9, 22] },
    { name: "Libra", symbol: "♎", start: [9, 23], end: [10, 22] },
    { name: "Scorpio", symbol: "♏", start: [10, 23], end: [11, 21] },
    { name: "Sagittarius", symbol: "♐", start: [11, 22], end: [12, 21] },
  ];

  const sign = zodiacDates.find(({ start, end }) => {
    const [startMonth, startDay] = start;
    const [endMonth, endDay] = end;
    const startsThisYear = month === startMonth && day >= startDay;
    const endsThisYear = month === endMonth && day <= endDay;

    return startMonth > endMonth
      ? startsThisYear || endsThisYear
      : startsThisYear || endsThisYear;
  });

  return sign ? `${sign.symbol} ${sign.name}` : "";
};

const formatMoodName = (mood: string) =>
  mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : "";

export default function HomePage() {
  const router = useRouter();
  const { activeTheme, setSelectedTheme } = useAppTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [homeSpace, setHomeSpace] = useState<HomeSpace | null>(null);
  const [plannerReminders, setPlannerReminders] = useState<PlannerHomeItem[]>(
    []
  );
  const [todayMood, setTodayMood] = useState<MoodHomeEntry | null>(null);

  useEffect(() => {
    const loadHome = () => {
      const storedUser = localStorage.getItem("currentLoggedInUser");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user: UserAccount = JSON.parse(storedUser);
      const savedHomeSpace = loadHomeSpace(user);
      const plannerItems = safeJsonParse<PlannerHomeItem[]>(
        localStorage.getItem(`plannerItems_${user.email}`),
        []
      );
      const moodEntries = safeJsonParse<MoodHomeEntry[]>(
        localStorage.getItem(`moodEntries_${user.email}`),
        []
      );
      const visiblePlannerItems = plannerItems
        .filter((item) => item.title && !(item.type === "task" && item.completed))
        .sort((first, second) => {
          const firstDate = `${first.date || "9999-12-31"} ${
            first.time || "99:99"
          }`;
          const secondDate = `${second.date || "9999-12-31"} ${
            second.time || "99:99"
          }`;

          return firstDate.localeCompare(secondDate);
        })
        .slice(0, 3);
      const today = new Date().toDateString();
      const moodForToday =
        moodEntries.find(
          (entry) => new Date(entry.date).toDateString() === today
        ) ?? null;

      setCurrentUser(user);
      setHomeSpace(savedHomeSpace);
      setSelectedTheme(savedHomeSpace.theme);
      setPlannerReminders(visiblePlannerItems);
      setTodayMood(moodForToday);
    };

    const timeoutId = window.setTimeout(loadHome, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router, setSelectedTheme]);

  const handleLogout = () => {
    localStorage.removeItem("currentLoggedInUser");
    router.push("/login");
  };

  const fallbackSpace = currentUser ? getDefaultHomeSpace(currentUser) : null;
  const space = homeSpace ?? fallbackSpace;
  const pageTheme = space ? themeByKey[space.theme] : activeTheme;
  const { cardClassName, titleClassName, highlightClassName } =
    getHomeStyleClasses(pageTheme, space?.widgetStyle, space?.colorPalette);
  const paperClassName = `${pageTheme.border} ${pageTheme.surfaceAlt}`;
  const needsLightSupportingText =
    pageTheme.value === "midnight" ||
    pageTheme.value === "cosmic" ||
    space?.colorPalette === "charcoal";
  const labelTextClassName = needsLightSupportingText
    ? "text-white/85"
    : pageTheme.accent;
  const supportTextClassName = needsLightSupportingText
    ? "text-zinc-100/80"
    : pageTheme.mutedText;
  const softPanelClassName = needsLightSupportingText
    ? "border-white/15 bg-white/10 text-zinc-100/80"
    : `${paperClassName} ${pageTheme.mutedText}`;
  const featureFontFamily = space
    ? fontFamilies[space.fontVibe] ?? fontFamilies.Inter
    : fontFamilies.Inter;
  const birthdayText = space?.birthday
    ? new Date(`${space.birthday}T00:00:00`).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      })
    : "";
  const zodiacText = space?.birthday ? getZodiacSign(space.birthday) : "";
  const headerIcons =
    space?.headerIcons && space.headerIcons.length > 0
      ? space.headerIcons.slice(0, 3)
      : ["✨", "🦋", "🌙"];

  return (
    <main
      className={`relative min-h-screen overflow-y-auto px-4 py-3 lg:h-screen lg:overflow-hidden ${pageTheme.background} ${pageTheme.text} ${pageTheme.pattern}`}
    >
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col">
        <div className="relative mb-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-xl shadow-sm transition ${pageTheme.secondaryButton}`}
            aria-label="Open navigation menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>

          {menuOpen && (
            <div
              className={`absolute right-0 top-14 z-30 w-44 rounded-3xl p-3 ${pageTheme.menu}`}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium ${pageTheme.menuItem}`}
                >
                  {link.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleLogout}
                className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium ${pageTheme.menuItem}`}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="grid flex-1 gap-3 lg:min-h-0 lg:grid-cols-12 lg:grid-rows-[1fr_1fr]">
          <section
            className={`relative overflow-hidden p-4 lg:col-span-4 lg:row-span-2 ${cardClassName}`}
          >
            <div className="absolute right-4 top-4 flex gap-2 text-xl">
              {headerIcons.map((accent, index) => (
                <span key={`${accent}-${index}`}>{accent}</span>
              ))}
            </div>
            <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full border border-current/10 opacity-25" />
            <div className="absolute -left-8 top-20 h-24 w-24 rotate-12 rounded-3xl border border-current/10 opacity-20" />
            <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] ${labelTextClassName}`}>
              Greatest Invention Yet
            </p>
            <h1
              className={`max-w-sm text-4xl font-semibold leading-[0.92] lg:text-6xl ${titleClassName}`}
              style={{ fontFamily: featureFontFamily }}
            >
              {space?.displayName || currentUser?.firstName || "Your"}&apos;s
              space
            </h1>
            <p
              className={`mt-3 inline-flex max-h-20 max-w-xs overflow-hidden whitespace-pre-line rounded-full px-3 py-1.5 text-sm font-medium leading-5 ${highlightClassName}`}
              style={{ fontFamily: featureFontFamily }}
            >
              {space?.personalTagline || "Romanticize your life."}
            </p>
            {birthdayText && (
              <p className={`mt-3 text-sm ${supportTextClassName}`}>
                Birthday: {birthdayText}
                {zodiacText ? ` ${zodiacText}` : ""}
              </p>
            )}
            <Link
              href="/edit-space"
              className={`mt-5 inline-flex rounded-full px-4 py-2 text-sm font-medium ${pageTheme.primaryButton}`}
            >
              Edit My Space
            </Link>
          </section>

          <section className={`p-3 lg:col-span-4 lg:row-span-2 ${cardClassName}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p
                className={`text-2xl font-semibold leading-none ${titleClassName}`}
                style={{ fontFamily: featureFontFamily }}
              >
                {space?.photoCaption || "Life Lately"}
              </p>
              <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wide ${highlightClassName}`}>
                Memories
              </span>
            </div>
            <div className="grid h-[360px] grid-cols-2 grid-rows-2 gap-2 lg:h-[calc(100%_-_2.75rem)]">
              {[0, 1, 2].map((index) => {
                const photo = space?.photoMemories[index];

                return (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-[1.25rem] border ${paperClassName} ${
                      index === 0 ? "row-span-2" : ""
                    }`}
                  >
                    {photo ? (
                      <Image
                        src={photo}
                        alt={`Memory ${index + 1}`}
                        fill
                        sizes="(min-width: 1024px) 280px, 45vw"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className={`flex h-full items-center justify-center px-4 text-center text-xs ${supportTextClassName}`}>
                        Memory {index + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`p-4 lg:col-span-4 ${cardClassName}`}>
            <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${labelTextClassName}`}>
              Daily intention
            </p>
            <p
              className={`line-clamp-3 text-2xl font-semibold leading-tight ${titleClassName}`}
              style={{ fontFamily: featureFontFamily }}
            >
              {space?.dailyIntention || "Move gently and keep it simple."}
            </p>
          </section>

          <section className={`p-2.5 lg:col-span-2 lg:self-start ${cardClassName}`}>
            <p className={`mb-1 text-[9px] font-semibold uppercase tracking-wide ${labelTextClassName}`}>
              Mood Today
            </p>
            {todayMood ? (
              <Link href="/mood" className="block">
                <p
                  className={`truncate text-base font-semibold leading-tight ${titleClassName}`}
                  style={{ fontFamily: featureFontFamily }}
                >
                  {todayMood.emoji} {formatMoodName(todayMood.mood)}
                </p>
              </Link>
            ) : (
              <Link
                href="/mood"
                className={`block rounded-2xl border px-3 py-2 text-xs font-medium ${softPanelClassName}`}
              >
                How are you feeling today?
              </Link>
            )}
          </section>

          <section className={`p-4 lg:col-span-2 ${cardClassName}`}>
            <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${labelTextClassName}`}>
              Weekly mantra
            </p>
            <p
              className={`line-clamp-4 text-sm leading-5 ${supportTextClassName}`}
              style={{ fontFamily: featureFontFamily }}
            >
              {space?.weeklyQuote || "Small rituals can change the whole day."}
            </p>
          </section>

          <section className={`p-4 lg:col-span-2 ${cardClassName}`}>
            <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${labelTextClassName}`}>
              Reminders
            </p>
            {plannerReminders.length === 0 ? (
              <p className={`rounded-2xl border p-3 text-sm ${softPanelClassName}`}>
                Nothing due.
              </p>
            ) : (
              <div className="space-y-2">
                {plannerReminders.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border px-3 py-2 ${paperClassName}`}
                  >
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <p className={`text-[10px] uppercase tracking-wide ${supportTextClassName}`}>
                      {getPrettyDate(item.date)}
                      {item.time ? ` · ${item.time}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={`p-4 lg:col-span-2 ${cardClassName}`}>
            <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${labelTextClassName}`}>
              Notes to self
            </p>
            <p
              className={`line-clamp-5 text-sm leading-5 ${supportTextClassName}`}
              style={{ fontFamily: featureFontFamily }}
            >
              {space?.notesToSelf ||
                "Leave yourself something kind from Edit My Space."}
            </p>
          </section>
        </div>

        <footer className={`mt-2 flex justify-center gap-4 pb-1 text-[11px] ${supportTextClassName}`}>
          <Link href="/terms" className="opacity-55 transition hover:opacity-90">
            Terms of Service
          </Link>
          <Link href="/privacy" className="opacity-55 transition hover:opacity-90">
            Privacy Policy
          </Link>
        </footer>
      </div>
    </main>
  );
}
