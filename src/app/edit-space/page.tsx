"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  colorPalettes,
  getDefaultHomeSpace,
  getHomeStyleClasses,
  loadHomeSpace,
  saveHomeSpace,
  widgetStylePresets,
  type HomeSpace,
  type UserAccount,
} from "../homeSpace";
import { themeByKey, themeOptions, useAppTheme } from "../theme";

const navLinks = [
  { href: "/home", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/mood", label: "Mood" },
  { href: "/planner", label: "Planner" },
];

const fontGroups = [
  {
    label: "Professional",
    options: ["Inter", "Helvetica", "Georgia"],
  },
  {
    label: "Soft",
    options: ["Playfair Display", "Cormorant", "Times New Roman"],
  },
  {
    label: "Fun",
    options: ["Impact", "Bebas Neue", "Permanent Marker", "Fredoka"],
  },
];

const headerIconOptions = ["✨", "🦋", "🌙", "🍒", "🪐", "⭐", "💋", "🌿"];
const taglineMaxLength = 100;

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

const compressImageFile = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    const image = document.createElement("img");

    image.onload = () => {
      const maxWidth = 500;
      const scale = Math.min(1, maxWidth / image.width);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Image compression is not available."));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };

    image.onerror = () => {
      reject(new Error("This photo could not be loaded."));
    };

    reader.onload = () => {
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("This photo could not be read."));
    reader.readAsDataURL(file);
  });
};

const formatTaglineInput = (value: string) => {
  return value
    .slice(0, taglineMaxLength)
    .split("\n")
    .slice(0, 3)
    .join("\n");
};

export default function EditSpacePage() {
  const router = useRouter();
  const { setSelectedTheme } = useAppTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [draftSpace, setDraftSpace] = useState<HomeSpace | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadSpace = () => {
      const storedUser = localStorage.getItem("currentLoggedInUser");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user: UserAccount = JSON.parse(storedUser);
      const savedHomeSpace = loadHomeSpace(user);

      setCurrentUser(user);
      setDraftSpace(savedHomeSpace);
    };

    const timeoutId = window.setTimeout(loadSpace, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("currentLoggedInUser");
    router.push("/login");
  };

  const updateDraft = (updates: Partial<HomeSpace>) => {
    setDraftSpace((currentDraft) =>
      currentDraft ? { ...currentDraft, ...updates } : currentDraft
    );
    setSavedMessage("");
    setErrorMessage("");
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!draftSpace) return;

    const files = Array.from(event.target.files ?? []).slice(
      0,
      3 - draftSpace.photoMemories.length
    );

    if (files.length === 0) return;

    Promise.all(files.map((file) => compressImageFile(file)))
      .then((newPhotos) => {
        updateDraft({
          photoMemories: [...draftSpace.photoMemories, ...newPhotos].slice(0, 3),
        });
      })
      .catch(() => {
        setErrorMessage("Photo is too large. Please try a smaller image.");
      });

    event.target.value = "";
  };

  const handleRemovePhoto = (photoIndex: number) => {
    if (!draftSpace) return;

    updateDraft({
      photoMemories: draftSpace.photoMemories.filter(
        (_, index) => index !== photoIndex
      ),
    });
  };

  const handleHeaderIconChange = (iconIndex: number, icon: string) => {
    if (!draftSpace) return;

    const updatedIcons = [...draftSpace.headerIcons];
    updatedIcons[iconIndex] = icon;

    updateDraft({ headerIcons: updatedIcons.slice(0, 3) });
  };

  const handleSave = () => {
    if (!currentUser || !draftSpace) return;

    const result = saveHomeSpace(currentUser, draftSpace);

    if (!result.ok) {
      setSavedMessage("");
      setErrorMessage(result.message ?? "Photo is too large. Please try a smaller image.");
      return;
    }

    setSelectedTheme(draftSpace.theme);
    setErrorMessage("");
    setSavedMessage("Saved. Your home space is updated.");
  };

  const space = draftSpace ?? (currentUser ? getDefaultHomeSpace(currentUser) : null);
  const pageTheme = space ? themeByKey[space.theme] : themeByKey["earth-tones"];
  const paperClassName = `${pageTheme.border} ${pageTheme.surfaceAlt}`;
  const {
    cardClassName: previewCardClassName,
    titleClassName: previewTitleClassName,
    highlightClassName: previewHighlightClassName,
  } = getHomeStyleClasses(pageTheme, space?.widgetStyle, space?.colorPalette);
  const previewFontFamily = space
    ? fontFamilies[space.fontVibe] ?? fontFamilies.Inter
    : fontFamilies.Inter;

  return (
    <main
      className={`relative min-h-screen px-5 py-6 sm:px-6 ${pageTheme.background} ${pageTheme.text} ${pageTheme.pattern}`}
    >
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="relative mb-5 flex items-center justify-end">
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

        <section className={`mb-4 p-5 ${pageTheme.cardStyle}`}>
          <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.24em] ${pageTheme.accent}`}>
            Edit My Space
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">
                Make it feel like yours.
              </h1>
              <p className={`mt-2 max-w-xl text-sm leading-6 ${pageTheme.mutedText}`}>
                Save your profile details, theme, notes, and photo memories here.
                The homepage stays display-only.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className={`rounded-full px-6 py-3 text-sm font-medium ${pageTheme.primaryButton}`}
            >
              Save My Space
            </button>
          </div>
          {savedMessage && (
            <p className={`mt-3 rounded-full px-4 py-2 text-sm ${pageTheme.badge}`}>
              {savedMessage}
            </p>
          )}
          {errorMessage && (
            <p className="mt-3 rounded-full bg-white/80 px-4 py-2 text-sm text-[#9b1c1c]">
              {errorMessage}
            </p>
          )}
        </section>

        {space && (
          <div className="grid gap-4 lg:grid-cols-3">
            <section className={`p-5 lg:col-span-2 ${pageTheme.cardStyle}`}>
              <p className={`mb-4 text-xs font-semibold uppercase tracking-wide ${pageTheme.accent}`}>
                Profile
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Display name
                  <input
                    value={space.displayName}
                    onChange={(event) =>
                      updateDraft({ displayName: event.target.value })
                    }
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 ${pageTheme.input}`}
                  />
                </label>

                <label className="text-sm font-medium sm:col-span-2">
                  Personal tagline
                  <textarea
                    value={space.personalTagline}
                    onChange={(event) =>
                      updateDraft({
                        personalTagline: formatTaglineInput(event.target.value),
                      })
                    }
                    placeholder="Romanticize your life."
                    maxLength={taglineMaxLength}
                    rows={3}
                    className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 leading-6 ${pageTheme.input}`}
                  />
                  <span className={`mt-1 block text-xs ${pageTheme.mutedText}`}>
                    1-3 short lines, {space.personalTagline.length}/{taglineMaxLength}
                  </span>
                </label>

                <label className="text-sm font-medium">
                  Birthday
                  <input
                    type="date"
                    value={space.birthday}
                    onChange={(event) =>
                      updateDraft({ birthday: event.target.value })
                    }
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 ${pageTheme.input}`}
                  />
                </label>

                <label className="text-sm font-medium">
                  Theme
                  <select
                    value={space.theme}
                    onChange={(event) =>
                      updateDraft({
                        theme: event.target.value as HomeSpace["theme"],
                      })
                    }
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 ${pageTheme.input}`}
                  >
                    {themeOptions.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium">
                  Font style
                  <select
                    value={space.fontVibe}
                    onChange={(event) =>
                      updateDraft({ fontVibe: event.target.value })
                    }
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 ${pageTheme.input}`}
                  >
                    {fontGroups.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((fontName) => (
                          <option key={fontName} value={fontName}>
                            {fontName}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className={`p-5 ${pageTheme.cardStyle}`}>
              <p className={`mb-4 text-xs font-semibold uppercase tracking-wide ${pageTheme.accent}`}>
                Homepage style
              </p>
              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  Widget style preset
                  <select
                    value={space.widgetStyle}
                    onChange={(event) =>
                      updateDraft({ widgetStyle: event.target.value })
                    }
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 ${pageTheme.input}`}
                  >
                    {widgetStylePresets.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium">
                  Color palette
                  <select
                    value={space.colorPalette}
                    onChange={(event) =>
                      updateDraft({ colorPalette: event.target.value })
                    }
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 ${pageTheme.input}`}
                  >
                    {colorPalettes.map((palette) => (
                      <option key={palette.value} value={palette.value}>
                        {palette.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className={`p-5 ${previewCardClassName}`}>
              <p className={`mb-3 text-xs font-semibold uppercase tracking-wide ${pageTheme.accent}`}>
                Live preview
              </p>
              <h2
                className={`text-3xl font-semibold leading-tight ${previewTitleClassName}`}
                style={{ fontFamily: previewFontFamily }}
              >
                {space.displayName || "Your"}&apos;s space
              </h2>
              <p
                className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${previewHighlightClassName}`}
                style={{ fontFamily: previewFontFamily }}
              >
                {space.personalTagline || "Romanticize your life."}
              </p>
              <p className={`mt-4 text-sm leading-6 ${pageTheme.mutedText}`}>
                Font, widget style, and palette changes preview here right
                away. They save only after you click Save My Space.
              </p>
            </section>

            <section className={`p-5 ${pageTheme.cardStyle}`}>
              <p className={`mb-4 text-xs font-semibold uppercase tracking-wide ${pageTheme.accent}`}>
                Header icons
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((iconIndex) => (
                  <label key={iconIndex} className="text-xs font-medium">
                    Icon {iconIndex + 1}
                    <select
                      value={space.headerIcons[iconIndex] ?? headerIconOptions[iconIndex]}
                      onChange={(event) =>
                        handleHeaderIconChange(iconIndex, event.target.value)
                      }
                      className={`mt-2 w-full rounded-2xl border px-3 py-3 text-lg ${pageTheme.input}`}
                    >
                      {headerIconOptions.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </section>

            <section className={`p-5 ${pageTheme.cardStyle}`}>
              <p className={`mb-4 text-xs font-semibold uppercase tracking-wide ${pageTheme.accent}`}>
                Photo memories
              </p>
              <label className="mb-4 block text-sm font-medium">
                Gallery caption
                <input
                  value={space.photoCaption}
                  onChange={(event) =>
                    updateDraft({ photoCaption: event.target.value })
                  }
                  placeholder="Life Lately"
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 ${pageTheme.input}`}
                />
              </label>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((index) => {
                  const photo = space.photoMemories[index];

                  return (
                    <div
                      key={index}
                      className={`relative aspect-square overflow-hidden rounded-2xl border ${paperClassName}`}
                    >
                      {photo ? (
                        <>
                          <Image
                            src={photo}
                            alt={`Memory ${index + 1}`}
                            width={220}
                            height={220}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div className={`flex h-full items-center justify-center text-center text-xs ${pageTheme.mutedText}`}>
                          Memory {index + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <label
                className={`block cursor-pointer rounded-full px-4 py-3 text-center text-sm font-medium ${pageTheme.secondaryButton}`}
              >
                Upload Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={space.photoMemories.length >= 3}
                  className="hidden"
                />
              </label>
              <p className={`mt-3 text-xs leading-5 ${pageTheme.mutedText}`}>
                Photos are staged here and saved only when you click Save My
                Space.
              </p>
            </section>

            <section className={`p-5 ${pageTheme.cardStyle}`}>
              <p className={`mb-3 text-xs font-semibold uppercase tracking-wide ${pageTheme.accent}`}>
                Daily intention
              </p>
              <input
                value={space.dailyIntention}
                onChange={(event) =>
                  updateDraft({ dailyIntention: event.target.value })
                }
                placeholder="Set your intention..."
                className={`w-full rounded-2xl border px-4 py-3 ${pageTheme.input}`}
              />
            </section>

            <section className={`p-5 ${pageTheme.cardStyle}`}>
              <p className={`mb-3 text-xs font-semibold uppercase tracking-wide ${pageTheme.accent}`}>
                Weekly quote
              </p>
              <textarea
                value={space.weeklyQuote}
                onChange={(event) =>
                  updateDraft({ weeklyQuote: event.target.value })
                }
                className={`min-h-28 w-full resize-none rounded-2xl border p-4 leading-6 ${pageTheme.input}`}
              />
            </section>

            <section className={`p-5 ${pageTheme.cardStyle}`}>
              <p className={`mb-3 text-xs font-semibold uppercase tracking-wide ${pageTheme.accent}`}>
                Notes to self
              </p>
              <textarea
                value={space.notesToSelf}
                onChange={(event) =>
                  updateDraft({ notesToSelf: event.target.value })
                }
                placeholder="Leave yourself something kind..."
                className={`min-h-28 w-full resize-none rounded-2xl border p-4 leading-6 ${pageTheme.input}`}
              />
            </section>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className={`rounded-full px-6 py-3 text-sm font-medium ${pageTheme.primaryButton}`}
          >
            Save My Space
          </button>
        </div>
      </div>
    </main>
  );
}
