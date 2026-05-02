"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type HomepageThemeKey =
  | "earth-tones"
  | "y2k"
  | "mature"
  | "red"
  | "midnight"
  | "cosmic"
  | "playhouse";

export type ThemeTokens = {
  name: string;
  value: HomepageThemeKey;
  description: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  mutedText: string;
  border: string;
  accent: string;
  accentSoft: string;
  shadow: string;
  pattern: string;
  cardStyle: string;
  decorativeElements: string[];
  input: string;
  primaryButton: string;
  secondaryButton: string;
  menu: string;
  menuItem: string;
  badge: string;
};

type ThemeContextValue = {
  activeTheme: ThemeTokens;
  selectedTheme: HomepageThemeKey;
  setSelectedTheme: (theme: HomepageThemeKey) => void;
};

const defaultThemeKey: HomepageThemeKey = "earth-tones";

export const appThemes: ThemeTokens[] = [
  {
    name: "Earth Tones",
    value: "earth-tones",
    description: "Botanical scrapbook, pressed paper, grounded and warm.",
    background:
      "bg-[#d9c9a7] bg-[radial-gradient(circle_at_10%_14%,rgba(63,82,45,0.26)_0,transparent_18%),radial-gradient(circle_at_84%_12%,rgba(128,87,53,0.24)_0,transparent_20%),radial-gradient(circle_at_72%_86%,rgba(79,104,67,0.24)_0,transparent_24%),linear-gradient(135deg,#fbf1dc_0%,#e2d0ac_38%,#b7a178_72%,#8e7b58_100%)]",
    surface: "bg-[#fff8e8]/96 backdrop-blur-sm",
    surfaceAlt: "bg-[#eadcc0]/92 backdrop-blur-sm",
    text: "text-[#263524]",
    mutedText: "text-[#685f49]",
    border: "border-[#9e8d66]/65",
    accent: "text-[#4f6843]",
    accentSoft: "bg-[#dfe8cf] text-[#3f5736]",
    shadow: "shadow-[0_26px_64px_rgba(58,70,41,0.22)]",
    pattern:
      "before:absolute before:inset-0 before:pointer-events-none before:opacity-45 before:bg-[radial-gradient(ellipse_at_20%_22%,rgba(72,92,50,0.18)_0,transparent_16%),radial-gradient(circle_at_8px_8px,rgba(88,70,42,0.10)_1px,transparent_1.5px),linear-gradient(90deg,rgba(95,118,79,0.08)_1px,transparent_1px),linear-gradient(rgba(104,87,55,0.07)_1px,transparent_1px),linear-gradient(115deg,transparent_0%,rgba(255,250,232,0.34)_34%,transparent_42%)] before:bg-[size:auto,22px_22px,42px_42px,42px_42px,260px_260px]",
    cardStyle:
      "rounded-[1.45rem] border bg-[#fff8e8]/96 shadow-[0_26px_64px_rgba(58,70,41,0.22)] ring-1 ring-white/45 backdrop-blur-sm",
    decorativeElements: ["🌿", "🦋", "✿"],
    input:
      "border-[#cfc3a1] bg-[#fffaf0] text-[#31402f] placeholder-[#8c8066] focus:ring-[#879b68]",
    primaryButton:
      "bg-[#5f764f] text-white shadow-[0_14px_28px_rgba(95,118,79,0.25)] hover:bg-[#4f6542]",
    secondaryButton:
      "border border-[#879b68] bg-[#fffaf0]/85 text-[#425237] hover:bg-[#edf4df]",
    menu:
      "border border-[#b9ad87]/70 bg-[#fffaf0]/95 shadow-[0_18px_40px_rgba(71,78,49,0.16)]",
    menuItem: "text-[#425237] hover:bg-[#edf4df]",
    badge: "bg-[#e3edd8] text-[#5f764f]",
  },
  {
    name: "Y2K",
    value: "y2k",
    description: "Glossy chrome, blue-pink nostalgia, early internet shine.",
    background:
      "bg-[#e7e9ff] bg-[radial-gradient(circle_at_11%_18%,rgba(255,119,222,0.48)_0,transparent_17%),radial-gradient(circle_at_84%_14%,rgba(96,165,250,0.52)_0,transparent_22%),radial-gradient(circle_at_54%_88%,rgba(196,181,253,0.48)_0,transparent_24%),linear-gradient(112deg,rgba(255,255,255,0.96)_0%,rgba(204,231,255,0.76)_28%,rgba(251,201,255,0.64)_56%,rgba(179,201,255,0.82)_100%)]",
    surface: "bg-white/82 backdrop-blur-md",
    surfaceAlt: "bg-[#f4f0ff]/90 backdrop-blur-md",
    text: "text-[#2a255c]",
    mutedText: "text-[#665d98]",
    border: "border-[#b4c7ff]/85",
    accent: "text-[#6d5bd6]",
    accentSoft: "bg-[#f5d7ff] text-[#7543a5]",
    shadow: "shadow-[0_24px_62px_rgba(101,90,190,0.26)]",
    pattern:
      "before:absolute before:inset-0 before:pointer-events-none before:opacity-55 before:bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.62)_42%,transparent_49%),radial-gradient(circle_at_18px_18px,rgba(124,104,216,0.18)_2px,transparent_3px),linear-gradient(135deg,rgba(255,255,255,0.42)_0%,transparent_18%,rgba(123,204,255,0.22)_28%,transparent_42%),radial-gradient(circle_at_92%_78%,rgba(255,255,255,0.44)_0,transparent_18%)] before:bg-[size:220px_220px,44px_44px,180px_180px,auto]",
    cardStyle:
      "rounded-[1.45rem] border bg-white/82 shadow-[0_24px_62px_rgba(101,90,190,0.26)] backdrop-blur-md ring-1 ring-white/75",
    decorativeElements: ["💿", "⭐", "✧"],
    input:
      "border-[#c8d5ff] bg-white/85 text-[#44346f] placeholder-[#8a7bb2] focus:ring-[#b7a5ff]",
    primaryButton:
      "bg-[#7c68d8] text-white shadow-[0_14px_28px_rgba(124,104,216,0.28)] hover:bg-[#6a58c7]",
    secondaryButton:
      "border border-[#b9c8ff] bg-white/80 text-[#5a4bb0] hover:bg-[#eef3ff]",
    menu:
      "border border-[#c8d5ff] bg-white/95 shadow-[0_18px_40px_rgba(111,93,188,0.16)]",
    menuItem: "text-[#5a4bb0] hover:bg-[#eef3ff]",
    badge: "bg-[#f7d8ff] text-[#7c48a2]",
  },
  {
    name: "Mature",
    value: "mature",
    description: "Editorial black, cream, fashion-page minimalism.",
    background:
      "bg-[#eee4d7] bg-[radial-gradient(circle_at_88%_12%,rgba(43,38,34,0.12)_0,transparent_18%),linear-gradient(115deg,#f6eee3_0%,#fffaf2_38%,#e0d3c4_72%,#c7b9a7_100%)]",
    surface: "bg-[#fffdf8]/94 backdrop-blur-sm",
    surfaceAlt: "bg-[#f7f1e8]/92 backdrop-blur-sm",
    text: "text-[#2b2622]",
    mutedText: "text-[#776b60]",
    border: "border-[#2b2622]/15",
    accent: "text-[#2b2622]",
    accentSoft: "bg-[#2b2622] text-white",
    shadow: "shadow-[0_24px_60px_rgba(45,38,33,0.16)]",
    pattern:
      "before:absolute before:inset-0 before:pointer-events-none before:opacity-24 before:bg-[linear-gradient(90deg,rgba(43,38,34,0.055)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.52)_0,transparent_30%),radial-gradient(circle_at_12px_12px,rgba(43,38,34,0.055)_1px,transparent_1.5px)] before:bg-[size:54px_54px,100%_100%,34px_34px]",
    cardStyle:
      "rounded-[0.95rem] border bg-[#fffdf8]/94 shadow-[0_24px_60px_rgba(45,38,33,0.16)] ring-1 ring-[#2b2622]/5 backdrop-blur-sm",
    decorativeElements: ["◒", "✦", "◆"],
    input:
      "border-[#d8cec2] bg-white text-[#2b2622] placeholder-[#8c8176] focus:ring-[#2b2622]",
    primaryButton:
      "bg-[#2b2622] text-white shadow-[0_14px_28px_rgba(43,38,34,0.22)] hover:bg-[#171411]",
    secondaryButton:
      "border border-[#2b2622]/30 bg-white/90 text-[#2b2622] hover:bg-[#f3ece4]",
    menu:
      "border border-[#2b2622]/15 bg-[#fffdf8]/95 shadow-[0_18px_40px_rgba(45,38,33,0.14)]",
    menuItem: "text-[#2b2622] hover:bg-[#f3ece4]",
    badge: "bg-[#2b2622] text-white",
  },
  {
    name: "Red",
    value: "red",
    description: "Cherry red, romantic cutouts, bold polished energy.",
    background:
      "bg-[#ffe8df] bg-[radial-gradient(circle_at_14%_16%,rgba(185,28,28,0.34)_0,transparent_20%),radial-gradient(circle_at_88%_8%,rgba(0,0,0,0.18)_0,transparent_18%),radial-gradient(circle_at_74%_84%,rgba(127,29,29,0.30)_0,transparent_24%),linear-gradient(135deg,#fff3e8_0%,#f3c1b8_40%,#b91c1c_76%,#4c0707_100%)]",
    surface: "bg-[#fff7ef]/93 backdrop-blur-sm",
    surfaceAlt: "bg-[#fff0e8]/92 backdrop-blur-sm",
    text: "text-[#531111]",
    mutedText: "text-[#8e4a42]",
    border: "border-[#b91c1c]/25",
    accent: "text-[#a31818]",
    accentSoft: "bg-[#ffe1dc] text-[#a31818]",
    shadow: "shadow-[0_24px_62px_rgba(127,29,29,0.24)]",
    pattern:
      "before:absolute before:inset-0 before:pointer-events-none before:opacity-26 before:bg-[linear-gradient(45deg,transparent_46%,rgba(163,24,24,0.22)_47%,rgba(163,24,24,0.22)_53%,transparent_54%),radial-gradient(circle_at_16px_16px,rgba(255,255,255,0.42)_1px,transparent_2px),linear-gradient(115deg,rgba(255,255,255,0.28)_0%,transparent_20%,rgba(76,7,7,0.18)_70%,transparent_100%)] before:bg-[size:30px_30px,58px_58px,260px_260px]",
    cardStyle:
      "rounded-[1.5rem] border bg-[#fff7ef]/93 shadow-[0_24px_62px_rgba(127,29,29,0.24)] ring-1 ring-white/35 backdrop-blur-sm",
    decorativeElements: ["🍒", "★", "♡"],
    input:
      "border-[#e6aaa0] bg-[#fffaf5] text-[#531111] placeholder-[#a66a62] focus:ring-[#b91c1c]",
    primaryButton:
      "bg-[#a31818] text-white shadow-[0_14px_28px_rgba(163,24,24,0.28)] hover:bg-[#861414]",
    secondaryButton:
      "border border-[#b91c1c]/35 bg-[#fffaf5]/90 text-[#7f1d1d] hover:bg-[#ffe8e0]",
    menu:
      "border border-[#b91c1c]/25 bg-[#fff7ef]/95 shadow-[0_18px_40px_rgba(127,29,29,0.18)]",
    menuItem: "text-[#7f1d1d] hover:bg-[#ffe8e0]",
    badge: "bg-[#ffe1dc] text-[#a31818]",
  },
  {
    name: "Midnight",
    value: "midnight",
    description: "Black, silver, night-drive texture, sleek focus.",
    background:
      "bg-[#07070a] bg-[radial-gradient(circle_at_18%_12%,rgba(161,161,170,0.20)_0,transparent_24%),radial-gradient(circle_at_84%_82%,rgba(82,82,91,0.26)_0,transparent_25%),linear-gradient(135deg,#3f3f46_0%,#18181b_42%,#050505_100%)]",
    surface: "bg-[#18181b]/90 backdrop-blur-md",
    surfaceAlt: "bg-[#27272a]/82 backdrop-blur-md",
    text: "text-[#f5f5f4]",
    mutedText: "text-[#c4c4cc]",
    border: "border-white/10",
    accent: "text-[#d4d4d8]",
    accentSoft: "bg-white/10 text-[#f5f5f4]",
    shadow: "shadow-[0_26px_70px_rgba(0,0,0,0.42)]",
    pattern:
      "before:absolute before:inset-0 before:pointer-events-none before:opacity-34 before:bg-[linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px),radial-gradient(circle_at_12px_14px,rgba(255,255,255,0.24)_1px,transparent_1.8px),linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_44%,transparent_54%)] before:bg-[size:22px_22px,64px_64px,260px_260px]",
    cardStyle:
      "rounded-[1.25rem] border bg-[#18181b]/90 shadow-[0_26px_70px_rgba(0,0,0,0.42)] ring-1 ring-white/5 backdrop-blur-md",
    decorativeElements: ["◐", "♪", "✦"],
    input:
      "border-white/10 bg-[#0f0f12]/80 text-[#f5f5f4] placeholder-[#a1a1aa] focus:ring-[#a1a1aa]",
    primaryButton:
      "bg-[#e5e5e5] text-[#111111] shadow-[0_14px_28px_rgba(229,229,229,0.16)] hover:bg-white",
    secondaryButton:
      "border border-white/15 bg-white/5 text-[#f5f5f4] hover:bg-white/10",
    menu:
      "border border-white/10 bg-[#18181b]/95 shadow-[0_18px_40px_rgba(0,0,0,0.35)]",
    menuItem: "text-[#f5f5f4] hover:bg-white/10",
    badge: "bg-white/10 text-[#f5f5f4]",
  },
  {
    name: "Cosmic",
    value: "cosmic",
    description: "Moons, planets, dark galaxy layers and calm futurism.",
    background:
      "bg-[#020617] bg-[radial-gradient(circle_at_18%_16%,rgba(139,92,246,0.48)_0,transparent_22%),radial-gradient(circle_at_82%_20%,rgba(37,99,235,0.38)_0,transparent_25%),radial-gradient(circle_at_62%_82%,rgba(236,72,153,0.18)_0,transparent_24%),linear-gradient(135deg,#4c1d95_0%,#172554_38%,#020617_100%)]",
    surface: "bg-[#0f172a]/86 backdrop-blur-md",
    surfaceAlt: "bg-[#1e1b4b]/74 backdrop-blur-md",
    text: "text-[#eef2ff]",
    mutedText: "text-[#c7d2fe]",
    border: "border-[#a78bfa]/25",
    accent: "text-[#c4b5fd]",
    accentSoft: "bg-[#312e81] text-[#e0e7ff]",
    shadow: "shadow-[0_26px_70px_rgba(15,23,42,0.42)]",
    pattern:
      "before:absolute before:inset-0 before:pointer-events-none before:opacity-58 before:bg-[radial-gradient(circle_at_8px_8px,rgba(255,255,255,0.62)_1px,transparent_2px),radial-gradient(circle_at_34px_28px,rgba(196,181,253,0.30)_1px,transparent_2px),linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_55%)] before:bg-[size:52px_52px,96px_96px,260px_260px]",
    cardStyle:
      "rounded-[1.5rem] border bg-[#0f172a]/86 shadow-[0_26px_70px_rgba(15,23,42,0.42)] ring-1 ring-white/5 backdrop-blur-md",
    decorativeElements: ["🌙", "🪐", "✦"],
    input:
      "border-[#818cf8]/30 bg-[#020617]/55 text-[#eef2ff] placeholder-[#a5b4fc] focus:ring-[#818cf8]",
    primaryButton:
      "bg-[#8b5cf6] text-white shadow-[0_14px_28px_rgba(139,92,246,0.28)] hover:bg-[#7c3aed]",
    secondaryButton:
      "border border-[#818cf8]/35 bg-white/5 text-[#eef2ff] hover:bg-white/10",
    menu:
      "border border-[#a78bfa]/25 bg-[#0f172a]/95 shadow-[0_18px_40px_rgba(15,23,42,0.35)]",
    menuItem: "text-[#eef2ff] hover:bg-white/10",
    badge: "bg-[#312e81] text-[#e0e7ff]",
  },
  {
    name: "Playhouse",
    value: "playhouse",
    description: "Checkerboard, abstract shapes, colorful creative room.",
    background:
      "bg-[#f9df86] bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.24)_0,transparent_16%),radial-gradient(circle_at_85%_12%,rgba(217,70,239,0.22)_0,transparent_18%),radial-gradient(circle_at_86%_86%,rgba(22,163,74,0.20)_0,transparent_17%),radial-gradient(circle_at_38%_72%,rgba(249,115,22,0.18)_0,transparent_20%),linear-gradient(135deg,#ffe993_0%,#bdebd0_34%,#b9d8ff_66%,#f2c6ff_100%)]",
    surface: "bg-white/96 backdrop-blur-sm",
    surfaceAlt: "bg-[#fff7d6]/94 backdrop-blur-sm",
    text: "text-[#202020]",
    mutedText: "text-[#514b43]",
    border: "border-[#202020]/18",
    accent: "text-[#c2410c]",
    accentSoft: "bg-[#fff0a8] text-[#202020]",
    shadow: "shadow-[0_22px_54px_rgba(43,43,43,0.18)]",
    pattern:
      "before:absolute before:inset-0 before:pointer-events-none before:opacity-[0.16] before:bg-[linear-gradient(45deg,#202020_25%,transparent_25%,transparent_75%,#202020_75%),linear-gradient(45deg,#202020_25%,transparent_25%,transparent_75%,#202020_75%),radial-gradient(circle_at_14px_14px,rgba(255,255,255,0.55)_3px,transparent_4px),linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.32)_42%,transparent_54%)] before:bg-[size:34px_34px,34px_34px,72px_72px,240px_240px] before:bg-[position:0_0,17px_17px,0_0,0_0]",
    cardStyle:
      "rounded-[1.25rem] border bg-white/96 shadow-[0_22px_54px_rgba(43,43,43,0.18)] ring-1 ring-white/55 backdrop-blur-sm",
    decorativeElements: ["🙂", "◆", "✿"],
    input:
      "border-[#2b2b2b]/20 bg-white text-[#252525] placeholder-[#6b665e] focus:ring-[#f97316]",
    primaryButton:
      "bg-[#2563eb] text-white shadow-[0_14px_28px_rgba(37,99,235,0.25)] hover:bg-[#1d4ed8]",
    secondaryButton:
      "border border-[#2b2b2b]/20 bg-white/90 text-[#252525] hover:bg-[#fff7d6]",
    menu:
      "border-2 border-[#2b2b2b]/20 bg-white/95 shadow-[0_18px_40px_rgba(43,43,43,0.16)]",
    menuItem: "text-[#252525] hover:bg-[#fff7d6]",
    badge: "bg-[#fde68a] text-[#252525]",
  },
];

export const themeOptions = appThemes.map((theme) => ({
  label: theme.name,
  value: theme.value,
}));

export const themeByKey = appThemes.reduce(
  (themes, theme) => ({ ...themes, [theme.value]: theme }),
  {} as Record<HomepageThemeKey, ThemeTokens>
);

export const normalizeThemeKey = (
  value: string,
  fallback: HomepageThemeKey = defaultThemeKey
): HomepageThemeKey => {
  return value in themeByKey ? (value as HomepageThemeKey) : fallback;
};

export const getThemeFromLegacyValue = (
  legacyTheme: string | undefined,
  backgroundColor: string | undefined
): HomepageThemeKey => {
  const normalizedTheme = legacyTheme?.toLowerCase();

  if (normalizedTheme?.includes("minimal")) return "mature";
  if (normalizedTheme?.includes("dreamy")) return "cosmic";
  if (normalizedTheme?.includes("scrapbook")) return "playhouse";
  if (normalizedTheme?.includes("cozy")) return "earth-tones";

  if (backgroundColor === "lavender") return "cosmic";
  if (backgroundColor === "sky") return "y2k";
  if (backgroundColor === "sage") return "earth-tones";
  if (backgroundColor === "blush") return "red";

  return defaultThemeKey;
};

const ThemeContext = createContext<ThemeContextValue>({
  activeTheme: themeByKey[defaultThemeKey],
  selectedTheme: defaultThemeKey,
  setSelectedTheme: () => {},
});

const getStorageKey = (key: string, email: string) => `${key}_${email}`;
const homeSpaceKey = "greatest-invention-home-space";

const safeJsonParse = <T,>(value: string | null, fallback: T) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getStoredTheme = () => {
  if (typeof window === "undefined") return defaultThemeKey;

  const storedUser = safeJsonParse<{ email?: string } | null>(
    localStorage.getItem("currentLoggedInUser"),
    null
  );
  const userEmail = storedUser?.email ?? "";
  const userTheme = userEmail
    ? localStorage.getItem(getStorageKey("selectedHomepageTheme", userEmail))
    : null;
  const savedHomeSpace = userEmail
    ? localStorage.getItem(`${homeSpaceKey}_${userEmail}`)
    : null;
  const homeSpaceTheme = safeJsonParse<{ theme?: string } | null>(
    savedHomeSpace,
    null
  )?.theme;

  return normalizeThemeKey(
    homeSpaceTheme ??
      userTheme ??
      localStorage.getItem("selectedHomepageTheme") ??
      defaultThemeKey
  );
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [selectedTheme, setSelectedThemeState] =
    useState<HomepageThemeKey>(defaultThemeKey);

  useEffect(() => {
    const syncTheme = () => setSelectedThemeState(getStoredTheme());

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener("homepage-theme-change", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("homepage-theme-change", syncTheme);
    };
  }, []);

  const setSelectedTheme = useCallback((theme: HomepageThemeKey) => {
    setSelectedThemeState(theme);

    const storedUser = safeJsonParse<{ email?: string } | null>(
      localStorage.getItem("currentLoggedInUser"),
      null
    );
    const userEmail = storedUser?.email ?? "";

    localStorage.setItem("selectedHomepageTheme", theme);

    if (userEmail) {
      localStorage.setItem(getStorageKey("selectedHomepageTheme", userEmail), theme);
    }

    window.dispatchEvent(new Event("homepage-theme-change"));
  }, []);

  const activeTheme = themeByKey[selectedTheme];
  const value = useMemo(
    () => ({ activeTheme, selectedTheme, setSelectedTheme }),
    [activeTheme, selectedTheme, setSelectedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={`relative min-h-screen overflow-hidden ${activeTheme.background} ${activeTheme.text} ${activeTheme.pattern}`}
      >
        <div className="relative z-10 min-h-screen">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
