"use client";

import {
  getThemeFromLegacyValue,
  normalizeThemeKey,
  type ThemeTokens,
  type HomepageThemeKey,
} from "./theme";

export type UserAccount = {
  name?: string;
  profilePicture?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
};

export type HomeSpace = {
  displayName: string;
  birthday: string;
  theme: HomepageThemeKey;
  fontVibe: string;
  personalTagline: string;
  widgetStyle: string;
  colorPalette: string;
  dailyIntention: string;
  weeklyQuote: string;
  notesToSelf: string;
  photoCaption: string;
  headerIcons: string[];
  photoMemories: string[];
};

type SavedHomeSpace = Partial<HomeSpace> & {
  cardColor?: string;
  titleColor?: string;
  highlightColor?: string;
};

type LegacyCustomization = {
  displayName?: string;
  birthday?: string;
  backgroundColor?: string;
  fontVibe?: string;
  themeVibe?: string;
};

export const homeSpaceKey = "greatest-invention-home-space";

export const getUserHomeSpaceKey = (email: string) =>
  `${homeSpaceKey}_${email}`;

const safeJsonParse = <T,>(value: string | null, fallback: T) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const normalizeFontVibe = (fontVibe: string | undefined) => {
  const legacyFontMap: Record<string, string> = {
    Classic: "Inter",
    Soft: "Playfair Display",
    Playful: "Fredoka",
    Elegant: "Georgia",
  };

  return fontVibe ? legacyFontMap[fontVibe] ?? fontVibe : "Inter";
};

export const colorPalettes = [
  {
    label: "Theme Default",
    value: "theme",
    cardClass: "",
    titleClass: "",
    highlightClass: "",
  },
  {
    label: "Cream",
    value: "cream",
    cardClass: "bg-[#fff8ea]/95",
    titleClass: "text-[#745538]",
    highlightClass: "bg-[#fff0c7] text-[#6b4b2a]",
  },
  {
    label: "Blush",
    value: "blush",
    cardClass: "bg-[#fff0f3]/95",
    titleClass: "text-[#9f405a]",
    highlightClass: "bg-[#ffdce5] text-[#8e344e]",
  },
  {
    label: "Sage",
    value: "sage",
    cardClass: "bg-[#edf5e8]/95",
    titleClass: "text-[#49683f]",
    highlightClass: "bg-[#dbeecf] text-[#3f6137]",
  },
  {
    label: "Lavender",
    value: "lavender",
    cardClass: "bg-[#f2edff]/95",
    titleClass: "text-[#6b56b3]",
    highlightClass: "bg-[#e4d9ff] text-[#5843a2]",
  },
  {
    label: "Sky",
    value: "sky",
    cardClass: "bg-[#edf7ff]/95",
    titleClass: "text-[#386fa4]",
    highlightClass: "bg-[#d8edff] text-[#2f6699]",
  },
  {
    label: "Cherry",
    value: "cherry",
    cardClass: "bg-[#fff1ef]/95",
    titleClass: "text-[#a31818]",
    highlightClass: "bg-[#ffd9d4] text-[#931717]",
  },
  {
    label: "Charcoal",
    value: "charcoal",
    cardClass: "bg-[#242424]/92",
    titleClass: "text-[#f5f0e8]",
    highlightClass: "bg-white/10 text-[#f5f0e8]",
  },
];

export const widgetStylePresets = [
  {
    label: "Minimal",
    value: "minimal",
    cardShape: "rounded-2xl",
    borderClass: "border",
    shadowClass: "shadow-sm",
    titleClass: "font-semibold",
    highlightClass: "rounded-full px-3 py-1.5",
  },
  {
    label: "Soft",
    value: "soft",
    cardShape: "rounded-[1.45rem]",
    borderClass: "border",
    shadowClass: "shadow-[0_22px_48px_rgba(80,60,50,0.12)]",
    titleClass: "font-semibold",
    highlightClass: "rounded-full px-3 py-1.5",
  },
  {
    label: "Bold",
    value: "bold",
    cardShape: "rounded-[1.25rem]",
    borderClass: "border-2",
    shadowClass: "shadow-[0_18px_38px_rgba(30,25,20,0.18)]",
    titleClass: "font-bold",
    highlightClass: "rounded-xl px-3 py-1.5",
  },
  {
    label: "Editorial",
    value: "editorial",
    cardShape: "rounded-xl",
    borderClass: "border",
    shadowClass: "shadow-[0_18px_36px_rgba(35,28,24,0.13)]",
    titleClass: "font-semibold tracking-wide",
    highlightClass: "rounded-none px-3 py-1.5 uppercase tracking-wide",
  },
  {
    label: "Playful",
    value: "playful",
    cardShape: "rounded-[1.6rem]",
    borderClass: "border-2 border-dashed",
    shadowClass: "shadow-[0_18px_40px_rgba(45,35,30,0.14)]",
    titleClass: "font-bold",
    highlightClass: "rounded-2xl px-3 py-1.5",
  },
];

export const getColorPalette = (value: string | undefined) => {
  return (
    colorPalettes.find((palette) => palette.value === value) ?? colorPalettes[0]
  );
};

export const getWidgetStylePreset = (value: string | undefined) => {
  return (
    widgetStylePresets.find((preset) => preset.value === value) ??
    widgetStylePresets[1]
  );
};

export const getHomeStyleClasses = (
  theme: ThemeTokens,
  widgetStyle: string | undefined,
  colorPalette: string | undefined
) => {
  const stylePreset = getWidgetStylePreset(widgetStyle);
  const palette = getColorPalette(colorPalette);
  const paletteCard =
    palette.value === "theme" ? theme.surface : palette.cardClass;
  const paletteTitle =
    palette.value === "theme" ? theme.accent : palette.titleClass;
  const paletteHighlight =
    palette.value === "theme" ? theme.badge : palette.highlightClass;

  return {
    cardClassName: `${stylePreset.cardShape} ${stylePreset.borderClass} ${theme.border} ${stylePreset.shadowClass} ${paletteCard}`,
    titleClassName: `${paletteTitle} ${stylePreset.titleClass}`,
    highlightClassName: `${paletteHighlight} ${stylePreset.highlightClass}`,
  };
};

export const getDefaultHomeSpace = (user: UserAccount): HomeSpace => ({
  displayName: user.firstName,
  birthday: user.birthday,
  theme: "earth-tones",
  fontVibe: "Inter",
  personalTagline: "Romanticize your life.",
  widgetStyle: "soft",
  colorPalette: "theme",
  dailyIntention: "",
  weeklyQuote: "Small rituals can change the whole day.",
  notesToSelf: "",
  photoCaption: "Life Lately",
  headerIcons: ["✨", "🦋", "🌙"],
  photoMemories: [],
});

export const loadHomeSpace = (user: UserAccount): HomeSpace => {
  const defaultSpace = getDefaultHomeSpace(user);
  const savedSpace = safeJsonParse<SavedHomeSpace>(
    localStorage.getItem(getUserHomeSpaceKey(user.email)) ??
      localStorage.getItem(homeSpaceKey),
    {}
  );
  const legacyCustomization = safeJsonParse<LegacyCustomization>(
    localStorage.getItem(`homeCustomization_${user.email}`),
    {}
  );
  const legacyTheme = getThemeFromLegacyValue(
    legacyCustomization.themeVibe,
    legacyCustomization.backgroundColor
  );
  const legacyColorPalette =
    [savedSpace.cardColor, savedSpace.titleColor, savedSpace.highlightColor].find(
      (value) => value && value !== "theme"
    ) ?? defaultSpace.colorPalette;

  const migratedSpace: HomeSpace = {
    ...defaultSpace,
    displayName:
      savedSpace.displayName ??
      legacyCustomization.displayName ??
      defaultSpace.displayName,
    birthday:
      savedSpace.birthday ?? legacyCustomization.birthday ?? defaultSpace.birthday,
    theme: normalizeThemeKey(savedSpace.theme ?? "", legacyTheme),
    fontVibe:
      normalizeFontVibe(
        savedSpace.fontVibe ?? legacyCustomization.fontVibe ?? defaultSpace.fontVibe
      ),
    personalTagline:
      savedSpace.personalTagline ?? defaultSpace.personalTagline,
    widgetStyle: savedSpace.widgetStyle ?? defaultSpace.widgetStyle,
    colorPalette: savedSpace.colorPalette ?? legacyColorPalette,
    dailyIntention:
      savedSpace.dailyIntention ??
      localStorage.getItem(`homepageDailyIntention_${user.email}`) ??
      localStorage.getItem("homepageDailyIntention") ??
      defaultSpace.dailyIntention,
    weeklyQuote:
      savedSpace.weeklyQuote ??
      localStorage.getItem(`homepageMantra_${user.email}`) ??
      localStorage.getItem("homepageMantra") ??
      defaultSpace.weeklyQuote,
    notesToSelf:
      savedSpace.notesToSelf ??
      localStorage.getItem(`homepageNotesToSelf_${user.email}`) ??
      localStorage.getItem("homepageNotesToSelf") ??
      defaultSpace.notesToSelf,
    photoCaption: savedSpace.photoCaption ?? defaultSpace.photoCaption,
    headerIcons: (savedSpace.headerIcons ?? defaultSpace.headerIcons).slice(0, 3),
    photoMemories: (
      savedSpace.photoMemories ??
      safeJsonParse<string[]>(
        localStorage.getItem(`homepagePhotos_${user.email}`) ??
          localStorage.getItem("homepagePhotos"),
        []
      )
    ).slice(0, 3),
  };

  return migratedSpace;
};

export const saveHomeSpace = (user: UserAccount, homeSpace: HomeSpace) => {
  const safeHomeSpace = {
    ...homeSpace,
    theme: normalizeThemeKey(homeSpace.theme, "earth-tones"),
    headerIcons: homeSpace.headerIcons.slice(0, 3),
    photoMemories: homeSpace.photoMemories.slice(0, 3),
  };
  const savedValue = JSON.stringify(safeHomeSpace);

  try {
    localStorage.removeItem(homeSpaceKey);
    localStorage.setItem(getUserHomeSpaceKey(user.email), savedValue);
  } catch (error) {
    const isQuotaError =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED");

    return {
      ok: false,
      message: isQuotaError
        ? "Photo is too large. Please try a smaller image."
        : "We could not save your space. Please try again.",
    };
  }

  try {
    localStorage.setItem(
      `homeCustomization_${user.email}`,
      JSON.stringify({
        displayName: safeHomeSpace.displayName,
        birthday: safeHomeSpace.birthday,
        backgroundColor: "cream",
        fontVibe: safeHomeSpace.fontVibe,
        themeVibe: safeHomeSpace.theme,
      })
    );
    localStorage.setItem(
      `selectedHomepageTheme_${user.email}`,
      safeHomeSpace.theme
    );
    localStorage.removeItem(`homepagePhotos_${user.email}`);
    localStorage.removeItem("homepagePhotos");
    window.dispatchEvent(new Event("homepage-theme-change"));
  } catch {
    // The primary home-space save already succeeded. Legacy compatibility writes
    // should never block the user's saved space.
  }

  return { ok: true };
};
