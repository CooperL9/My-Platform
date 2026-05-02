"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getHomeStyleClasses,
  loadHomeSpace,
  type HomeSpace,
} from "../homeSpace";
import { useAppTheme } from "../theme";

type PlannerType = "task" | "event" | "meeting" | "reminder";
type PlannerView = "day" | "week" | "month";

type PlannerItem = {
  id: number;
  title: string;
  type: PlannerType;
  date: string;
  time: string;
  note: string;
  color: string;
  icon: string;
  completed: boolean;
};

type StoredTask = {
  id?: number;
  text?: string;
  title?: string;
  type?: PlannerType;
  date?: string;
  time?: string;
  note?: string;
  color?: string;
  icon?: string;
  completed?: boolean;
};

type UserAccount = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
};

const colors = [
  { name: "Rose", value: "bg-[#fdecef]" },
  { name: "Blush", value: "bg-[#f9e1df]" },
  { name: "Latte", value: "bg-[#f4e4d4]" },
  { name: "Cream", value: "bg-[#fff7df]" },
  { name: "Sage", value: "bg-[#edf7ed]" },
  { name: "Blue", value: "bg-[#edf3ff]" },
];

const icons = ["✨", "💻", "🛒", "💕", "📌", "☕", "🏋🏽‍♀️", "📅"];

const affirmations = [
  "You are allowed to move gently.",
  "You are doing better than you think.",
  "Progress is still progress.",
  "You don't have to rush your growth.",
  "Small steps still count.",
  "You deserve calm and clarity.",
  "Give yourself permission to rest.",
  "You are becoming who you need to be.",
];

const navLinks = [
  { href: "/home", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/mood", label: "Mood" },
  { href: "/planner", label: "Planner" },
];

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getPrettyDate = (dateKey: string) => {
  if (!dateKey) return "Any day";

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const getFullDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return start;
};

const getWeekDays = (date: Date) => {
  const start = getStartOfWeek(date);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);

    return day;
  });
};

const getMonthCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlankDays = firstDay.getDay();
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    return new Date(year, month, index + 1);
  });

  return [...Array<Date | null>(leadingBlankDays).fill(null), ...days];
};

const getWeekRange = (date: Date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startText = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endText = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startText} - ${endText}`;
};

const getWeeklyAffirmation = () => {
  const today = new Date();
  const currentSunday = getStartOfWeek(today);
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const firstSunday = getStartOfWeek(firstDayOfYear);
  const weekNumber = Math.floor(
    (currentSunday.getTime() - firstSunday.getTime()) / (7 * 86400000)
  );

  return affirmations[weekNumber % affirmations.length];
};

export default function PlannerPage() {
  const router = useRouter();
  const { activeTheme } = useAppTheme();
  const todayKey = getDateKey(new Date());

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [homeSpace, setHomeSpace] = useState<HomeSpace | null>(null);
  const [activeView, setActiveView] = useState<PlannerView>("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PlannerType>("task");
  const [date, setDate] = useState(todayKey);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [color, setColor] = useState(colors[0].value);
  const [icon, setIcon] = useState(icons[0]);
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [hasLoadedItems, setHasLoadedItems] = useState(false);

  useEffect(() => {
    const loadItems = () => {
      const storedUser = localStorage.getItem("currentLoggedInUser");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user: UserAccount = JSON.parse(storedUser);
      const storedTasks = localStorage.getItem(`plannerItems_${user.email}`);

      setCurrentUser(user);
      setHomeSpace(loadHomeSpace(user));

      if (storedTasks) {
        const parsedTasks: StoredTask[] = JSON.parse(storedTasks);

        const upgradedItems = parsedTasks.map((task) => {
          const savedDate = task.date || todayKey;
          const dateOnly = savedDate.includes("T")
            ? savedDate.split("T")[0]
            : savedDate;

          return {
            id: task.id || Date.now(),
            title: task.title || task.text || "",
            type: task.type || "task",
            date: dateOnly,
            time: task.time || "",
            note: task.note || "",
            color: task.color || colors[0].value,
            icon: task.icon || icons[0],
            completed: Boolean(task.completed),
          };
        });

        setItems(upgradedItems);
      } else {
        setItems([]);
      }

      setHasLoadedItems(true);
    };

    const timeoutId = window.setTimeout(loadItems, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router, todayKey]);

  useEffect(() => {
    if (!hasLoadedItems) return;
    if (!currentUser) return;

    localStorage.setItem(
      `plannerItems_${currentUser.email}`,
      JSON.stringify(items)
    );
  }, [currentUser, hasLoadedItems, items]);

  const handleLogout = () => {
    localStorage.removeItem("currentLoggedInUser");
    router.push("/login");
  };

  const handleAddItem = () => {
    if (!currentUser) return;
    if (title.trim() === "") return;

    const newItem = {
      id: Date.now(),
      title: title.trim(),
      type,
      date,
      time,
      note: note.trim(),
      color,
      icon,
      completed: false,
    };

    setItems([newItem, ...items]);
    setTitle("");
    setTime("");
    setNote("");
  };

  const handleToggleItem = (id: number) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    setItems(updatedItems);
  };

  const handleDeleteItem = (id: number) => {
    const updatedItems = items.filter((item) => item.id !== id);

    setItems(updatedItems);
  };

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);

    if (activeView === "day") {
      newDate.setDate(newDate.getDate() - 1);
    }

    if (activeView === "week") {
      newDate.setDate(newDate.getDate() - 7);
    }

    if (activeView === "month") {
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() - 1);
    }

    if (activeView === "day") {
      setDate(getDateKey(newDate));
    }

    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);

    if (activeView === "day") {
      newDate.setDate(newDate.getDate() + 1);
    }

    if (activeView === "week") {
      newDate.setDate(newDate.getDate() + 7);
    }

    if (activeView === "month") {
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + 1);
    }

    if (activeView === "day") {
      setDate(getDateKey(newDate));
    }

    setSelectedDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();

    if (activeView === "day") {
      setDate(getDateKey(today));
    }

    setSelectedDate(today);
  };

  const sortedItems = [...items].sort((first, second) => {
    const firstTime = `${first.date || "9999-12-31"} ${first.time || "99:99"}`;
    const secondTime = `${second.date || "9999-12-31"} ${
      second.time || "99:99"
    }`;

    return firstTime.localeCompare(secondTime);
  });

  const selectedDateKey = getDateKey(selectedDate);
  const selectedDayItems = sortedItems.filter(
    (item) => item.date === selectedDateKey
  );
  const weekDays = getWeekDays(selectedDate);
  const monthDays = getMonthCalendarDays(selectedDate);
  const monthName = selectedDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const navigationUnit =
    activeView === "day" ? "day" : activeView === "week" ? "week" : "month";
  const navigationLabel =
    activeView === "day"
      ? getFullDate(selectedDate)
      : activeView === "week"
      ? getWeekRange(selectedDate)
      : monthName;

  const getItemsForDate = (dateKey: string) => {
    return sortedItems.filter((item) => item.date === dateKey);
  };

  const openDay = (day: Date) => {
    const dayKey = getDateKey(day);

    setSelectedDate(day);
    setDate(dayKey);
    setActiveView("day");
  };

  const { cardClassName, titleClassName, highlightClassName } =
    getHomeStyleClasses(
      activeTheme,
      homeSpace?.widgetStyle,
      homeSpace?.colorPalette
    );
  const isDarkTheme =
    activeTheme.value === "midnight" ||
    activeTheme.value === "cosmic" ||
    homeSpace?.colorPalette === "charcoal";
  const pageOverlayClassName = isDarkTheme
    ? "bg-black/35 backdrop-blur-[1px]"
    : "bg-[#fff9ef]/45 backdrop-blur-[1px]";
  const eyebrowClassName = `mb-2 text-xs font-semibold uppercase tracking-[0.22em] ${
    isDarkTheme ? "text-zinc-100/75" : activeTheme.accent
  }`;
  const supportTextClassName = isDarkTheme
    ? "text-zinc-100/75"
    : activeTheme.mutedText;
  const paperClassName = isDarkTheme
    ? "border-white/10 bg-[#111116]/88 text-zinc-100 shadow-[0_22px_55px_rgba(0,0,0,0.32)]"
    : "border-white/80 bg-white/92 text-[#2f2924] shadow-[0_20px_46px_rgba(65,50,40,0.11)]";
  const paperAltClassName = isDarkTheme
    ? "border-white/10 bg-white/8 text-zinc-100"
    : `${activeTheme.border} ${activeTheme.surfaceAlt} ${activeTheme.text}`;
  const quietTextClassName = isDarkTheme
    ? "text-zinc-100/60"
    : "text-[#8f8175]";
  const inputClassName = `w-full rounded-full border px-5 py-3 text-sm shadow-[inset_0_2px_8px_rgba(70,50,40,0.05)] focus:outline-none focus:ring-2 ${activeTheme.input}`;
  const textareaClassName = `h-24 w-full resize-none rounded-[1.5rem] border p-4 text-sm leading-6 shadow-[inset_0_2px_8px_rgba(70,50,40,0.05)] focus:outline-none focus:ring-2 ${activeTheme.input}`;
  const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderPlannerItem = (item: PlannerItem) => {
    return (
      <div
        key={item.id}
        className={`rounded-[1.35rem] border border-white/75 ${item.color} p-4 text-sm text-[#3e312b] shadow-[0_10px_24px_rgba(70,50,40,0.09)]`}
      >
        <div className="flex items-start gap-3">
          {item.type === "task" && (
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => handleToggleItem(item.id)}
              className="mt-1 h-5 w-5 accent-[#b5796d]"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/70 px-2 py-1 text-lg shadow-sm">
                {item.icon}
              </span>
              <p
                className={`font-medium ${
                  item.completed
                    ? "text-[#9f918a] line-through"
                    : "text-[#3e312b]"
                }`}
              >
                {item.title}
              </p>
            </div>

            <p className="text-xs uppercase text-[#a67666]">{item.type}</p>

            {(item.date || item.time) && (
              <p className="mt-2 text-xs text-[#7d5c50]">
                {getPrettyDate(item.date)}
                {item.time ? ` at ${item.time}` : ""}
              </p>
            )}

            {item.note && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#6d5047]">
                {item.note}
              </p>
            )}
          </div>

          <button
            onClick={() => handleDeleteItem(item.id)}
            className="rounded-full px-2 py-1 text-xs text-[#9b6d60] transition hover:bg-white/60"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className={`relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-8 ${activeTheme.background} ${activeTheme.pattern} ${activeTheme.text}`}>
      <div className={`absolute inset-0 ${pageOverlayClassName}`} />
      <div
        aria-hidden="true"
        className="absolute left-8 top-24 h-28 w-28 rounded-full bg-white/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute right-0 top-72 h-36 w-36 rounded-full bg-white/20 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl">
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

        <div className="mb-8 text-center">
          <p className={eyebrowClassName}>
            The weekly edit
          </p>
          <h1 className={`text-4xl font-semibold leading-tight sm:text-5xl ${titleClassName}`}>
            Planner
          </h1>

          <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${supportTextClassName}`}>
            A soft space for your tasks, plans, and reminders.
          </p>
        </div>

        <div className={`relative mb-6 overflow-hidden p-5 sm:p-6 ${cardClassName}`}>
          <span
            aria-hidden="true"
            className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/25"
          />
          <span
            aria-hidden="true"
            className={`absolute right-10 top-7 text-lg ${supportTextClassName}`}
          >
            {activeTheme.decorativeElements[0] ?? "✦"}
          </span>
          <span
            aria-hidden="true"
            className={`absolute bottom-5 right-7 text-sm ${supportTextClassName}`}
          >
            {activeTheme.decorativeElements[1] ?? "✨"}
          </span>

          <div className="relative mb-4">
            <p className={eyebrowClassName}>
              Weekly affirmation
            </p>
          </div>
          <p className={`relative max-w-xl text-xl font-medium leading-relaxed sm:text-2xl ${activeTheme.text}`}>
            {getWeeklyAffirmation()}
          </p>
        </div>

        <div className={`mb-6 p-5 sm:p-6 ${cardClassName}`}>
          <div className="mb-5">
            <div>
              <p className={eyebrowClassName}>
                Capture
              </p>
              <h2 className={`mt-1 text-2xl font-semibold ${activeTheme.text}`}>
                Add to your plan
              </h2>
            </div>
          </div>

          <label
            htmlFor="title"
            className={`mb-3 block text-xs font-semibold uppercase tracking-[0.18em] ${supportTextClassName}`}
          >
            Planner item
          </label>

          <div className="space-y-4">
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddItem();
                }
              }}
              placeholder="Add something gentle..."
              className={inputClassName}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PlannerType)}
                className={inputClassName}
              >
                <option value="task">Task</option>
                <option value="event">Event</option>
                <option value="meeting">Meeting</option>
                <option value="reminder">Reminder</option>
              </select>

              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);

                  if (e.target.value) {
                    setSelectedDate(new Date(`${e.target.value}T00:00:00`));
                  }
                }}
                className={inputClassName}
              />

              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClassName}
              />

              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={inputClassName}
              >
                {colors.map((colorOption) => (
                  <option key={colorOption.value} value={colorOption.value}>
                    {colorOption.name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              className={textareaClassName}
            />

            <div className={`rounded-[1.5rem] border p-3 shadow-[inset_0_2px_8px_rgba(70,50,40,0.05)] ${paperAltClassName}`}>
              <div className="mb-3 flex items-center justify-between">
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${supportTextClassName}`}>
                  Sticker tray
                </p>
                <span className={`text-xs ${supportTextClassName}`}>✦ ✦</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {icons.map((iconOption) => (
                  <button
                    key={iconOption}
                    onClick={() => setIcon(iconOption)}
                    className={`h-11 w-11 rounded-full border text-lg shadow-sm transition ${
                      icon === iconOption
                        ? `${activeTheme.border} bg-white shadow-[0_10px_22px_rgba(70,50,40,0.14)]`
                        : "border-white/70 bg-white/60 hover:-translate-y-0.5 hover:bg-white"
                    }`}
                  >
                    {iconOption}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddItem}
              className={`w-full rounded-full py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${activeTheme.primaryButton}`}
            >
              Add to Planner
            </button>
          </div>
        </div>

        <div className={`mb-5 grid grid-cols-3 rounded-full border p-1.5 ${paperClassName}`}>
          {(["day", "week", "month"] as PlannerView[]).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`rounded-full py-3 text-sm font-medium capitalize transition ${
                activeView === view
                  ? activeTheme.primaryButton
                  : `${supportTextClassName} hover:bg-white/20`
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        <div className={`mb-6 rounded-[1.75rem] border p-4 ${paperClassName}`}>
          <p className={`mb-3 text-center text-sm font-semibold ${activeTheme.text}`}>
            {navigationLabel}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePrevious}
              className={`rounded-full px-3 py-3 text-xs font-medium leading-tight shadow-sm transition hover:-translate-y-0.5 sm:text-sm ${activeTheme.secondaryButton}`}
            >
              Previous {navigationUnit}
            </button>

            <button
              onClick={handleToday}
              className={`rounded-full px-3 py-3 text-xs font-medium leading-tight transition hover:-translate-y-0.5 sm:text-sm ${activeTheme.primaryButton}`}
            >
              Today
            </button>

            <button
              onClick={handleNext}
              className={`rounded-full px-3 py-3 text-xs font-medium leading-tight shadow-sm transition hover:-translate-y-0.5 sm:text-sm ${activeTheme.secondaryButton}`}
            >
              Next {navigationUnit}
            </button>
          </div>
        </div>

        {activeView === "day" && (
          <div className={`relative rounded-[2rem] border p-5 sm:p-6 ${paperClassName}`}>
            <span
              aria-hidden="true"
              className={`absolute right-6 top-6 text-sm ${supportTextClassName}`}
            >
              ✦
            </span>
            <p className={eyebrowClassName}>
              Planner page
            </p>
            <h2 className={`mb-1 text-2xl font-semibold ${activeTheme.text}`}>Day</h2>
            <p className={`mb-5 text-sm ${supportTextClassName}`}>
              {getFullDate(selectedDate)}
            </p>

            {selectedDayItems.length === 0 ? (
              <p className={`rounded-[1.5rem] border p-4 text-sm ${paperAltClassName}`}>
                No plans for this day yet.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDayItems.map((item) => renderPlannerItem(item))}
              </div>
            )}
          </div>
        )}

        {activeView === "week" && (
          <div className={`relative rounded-[2rem] border p-5 sm:p-6 ${paperClassName}`}>
            <span
              aria-hidden="true"
              className={`absolute right-6 top-6 text-sm ${supportTextClassName}`}
            >
              ✦
            </span>
            <p className={eyebrowClassName}>
              Planner spread
            </p>
            <h2 className={`mb-1 text-2xl font-semibold ${activeTheme.text}`}>Week</h2>
            <p className={`mb-5 text-sm ${supportTextClassName}`}>
              {getWeekRange(selectedDate)}
            </p>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
              {weekDays.map((day) => {
                const dayKey = getDateKey(day);
                const dayItems = getItemsForDate(dayKey);
                const isToday = dayKey === todayKey;
                const isSelected = dayKey === selectedDateKey;

                return (
                  <div
                    key={dayKey}
                    className={`min-h-48 rounded-[1.35rem] border p-3 shadow-[0_10px_24px_rgba(60,45,35,0.08)] ${
                      isSelected ? activeTheme.surface : paperAltClassName
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openDay(day)}
                      className={`mb-3 flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition hover:-translate-y-0.5 ${
                        isToday || isSelected
                          ? activeTheme.primaryButton
                          : activeTheme.secondaryButton
                      }`}
                    >
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-[0.16em]">
                          {day.toLocaleDateString(undefined, { weekday: "short" })}
                        </span>
                        <span className="text-sm font-semibold">
                          {day.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </span>
                      {dayItems.length > 0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/25 px-2 text-xs font-bold">
                          {dayItems.length}
                        </span>
                      )}
                    </button>

                    {dayItems.length === 0 ? (
                      <p className={`rounded-2xl border border-dashed p-3 text-xs ${quietTextClassName}`}>
                        Nothing planned.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dayItems.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => openDay(day)}
                            className={`w-full rounded-2xl border border-white/60 ${item.color} p-2 text-left text-xs text-[#3e312b] shadow-sm transition hover:-translate-y-0.5`}
                          >
                            <span className="mb-1 flex items-center gap-1.5 font-semibold">
                              <span>{item.icon}</span>
                              <span className="truncate">{item.title}</span>
                            </span>
                            <span className="text-[11px] uppercase text-[#7d695e]">
                              {item.time || item.type}
                            </span>
                          </button>
                        ))}
                        {dayItems.length > 4 && (
                          <p className={`px-2 text-xs ${quietTextClassName}`}>
                            +{dayItems.length - 4} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === "month" && (
          <div className={`relative rounded-[2rem] border p-4 sm:p-6 ${paperClassName}`}>
            <span
              aria-hidden="true"
              className={`absolute right-6 top-6 text-sm ${supportTextClassName}`}
            >
              ✦
            </span>
            <p className={eyebrowClassName}>
              Month overview
            </p>
            <h2 className={`mb-5 text-2xl font-semibold ${activeTheme.text}`}>
              {monthName}
            </h2>

            <div className="mb-2 grid grid-cols-7 gap-1.5 text-center sm:gap-2">
              {weekDayLabels.map((label) => (
                <div
                  key={label}
                  className={`rounded-full py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${supportTextClassName}`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {monthDays.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div
                      key={`blank-${dayIndex}`}
                      className="min-h-20 rounded-2xl border border-transparent sm:min-h-24"
                    />
                  );
                }

                const dayKey = getDateKey(day);
                const dayItems = getItemsForDate(dayKey);
                const isToday = dayKey === todayKey;
                const isSelected = dayKey === selectedDateKey;

                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => openDay(day)}
                    className={`flex min-h-20 flex-col items-start rounded-2xl border p-2 text-left shadow-[0_8px_18px_rgba(60,45,35,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(60,45,35,0.10)] sm:min-h-24 sm:p-3 ${
                      isSelected
                        ? activeTheme.surface
                        : isToday
                        ? `${activeTheme.surfaceAlt} ring-2 ring-white/40`
                        : paperAltClassName
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday || isSelected
                          ? activeTheme.primaryButton
                          : "bg-white/60 text-[#51453d]"
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {dayItems.length > 0 && (
                      <span className="mt-auto flex items-center gap-1 pt-3">
                        <span className={`h-2 w-2 rounded-full ${activeTheme.accentSoft.split(" ")[0] || "bg-[#d8b4a0]"}`} />
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${highlightClassName}`}>
                          {dayItems.length}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {sortedItems.some((item) => !item.date) && (
          <div className={`mt-6 rounded-[2rem] border p-6 ${paperClassName}`}>
            <p className={eyebrowClassName}>
              Flexible list
            </p>
            <h2 className={`mb-4 text-2xl font-semibold ${activeTheme.text}`}>
              Any Day
            </h2>

            <div className="space-y-3">
              {sortedItems
                .filter((item) => !item.date)
                .map((item) => renderPlannerItem(item))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
