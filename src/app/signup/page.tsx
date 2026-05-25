"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserAccount = {
  name?: string;
  profilePicture?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
  agreedToTerms: boolean;
  signatureName: string;
  agreementDate: string;
};

type StoredUserAccount = Partial<UserAccount> & {
  email?: string;
  password?: string;
};

const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getPrettyDate = (dateKey: string) => {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const compressProfileImage = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    const image = document.createElement("img");

    image.onload = () => {
      const maxSize = 320;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Image preview is not available."));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.68));
    };

    image.onerror = () => reject(new Error("This photo could not be loaded."));
    reader.onerror = () => reject(new Error("This photo could not be read."));
    reader.onload = () => {
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
};

const parseStoredUsers = (storedUsers: string | null) => {
  if (!storedUsers) return [];

  try {
    const parsedUsers = JSON.parse(storedUsers) as
      | StoredUserAccount
      | StoredUserAccount[];

    return Array.isArray(parsedUsers) ? parsedUsers : [parsedUsers];
  } catch {
    return [];
  }
};

const normalizeUser = (user: StoredUserAccount): UserAccount | null => {
  const email = user.email?.trim().toLowerCase();
  const password = user.password ?? "";

  if (!email || !password) return null;

  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";

  return {
    name: user.name || `${firstName} ${lastName}`.trim() || email,
    profilePicture: user.profilePicture ?? "",
    firstName,
    lastName,
    email,
    password,
    birthday: user.birthday ?? "",
    agreedToTerms: Boolean(user.agreedToTerms),
    signatureName: user.signatureName ?? "",
    agreementDate: user.agreementDate ?? "",
  };
};

const loadUsers = () => {
  const storedUsers = parseStoredUsers(localStorage.getItem("users"));
  const legacyUsers = parseStoredUsers(localStorage.getItem("userAccounts"));
  const usersByEmail = new Map<string, UserAccount>();

  [...legacyUsers, ...storedUsers].forEach((user) => {
    const normalizedUser = normalizeUser(user);

    if (normalizedUser) {
      usersByEmail.set(normalizedUser.email, normalizedUser);
    }
  });

  return Array.from(usersByEmail.values());
};

export default function SignupPage() {
  const router = useRouter();
  const agreementDate = getTodayKey();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const canCreateAccount = acceptedAgreement && signatureName.trim() !== "";
  const inputClassName =
    "w-full rounded-[1.35rem] border border-[#d8c7ba]/80 bg-[#fffaf4]/78 px-4 py-3 text-sm text-[#2e241f] shadow-[inset_0_1px_10px_rgba(66,46,36,0.045)] placeholder-[#9a877d] outline-none backdrop-blur transition focus:border-[#9caf8a] focus:bg-white/92 focus:ring-2 focus:ring-[#d7e2c8]";
  const labelClassName =
    "mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#816254]";
  const legalLinkClassName =
    "font-semibold text-[#425f45] underline decoration-[#b8c7aa] underline-offset-4 transition hover:text-[#263c2a]";

  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file for your profile photo.");
      event.target.value = "";
      return;
    }

    compressProfileImage(file)
      .then((compressedImage) => {
        setProfilePicture(compressedImage);
        setErrorMessage("");
      })
      .catch(() => {
        setErrorMessage("That photo is too large. Please try a smaller image.");
      });

    event.target.value = "";
  };

  const handleSignup = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !birthday
    ) {
      setErrorMessage("Please fill out every field before creating an account.");
      return;
    }

    if (!acceptedAgreement || !signatureName.trim()) {
      setErrorMessage(
        "Please agree to the Terms and Privacy Policy and type your signature."
      );
      return;
    }

    const accounts = loadUsers();

    const normalizedEmail = email.trim().toLowerCase();
    const accountExists = accounts.some(
      (account) => account.email.toLowerCase() === normalizedEmail
    );

    if (accountExists) {
      setErrorMessage("An account with this email already exists.");
      return;
    }

    const newAccount = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      profilePicture,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      birthday,
      agreedToTerms: true,
      signatureName: signatureName.trim(),
      agreementDate,
    };

    const updatedAccounts = [...accounts, newAccount];

    try {
      localStorage.setItem("users", JSON.stringify(updatedAccounts));
      localStorage.setItem("currentLoggedInUser", JSON.stringify(newAccount));
    } catch {
      setErrorMessage(
        "Your profile photo is too large to save. Please try a smaller image."
      );
      return;
    }

    router.push("/home");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e7d8c9] px-4 py-6 text-[#2e241f] sm:px-6 lg:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_11%_14%,rgba(74,94,63,0.32)_0,transparent_24%),radial-gradient(circle_at_84%_12%,rgba(196,128,150,0.28)_0,transparent_22%),radial-gradient(circle_at_68%_92%,rgba(123,89,70,0.28)_0,transparent_26%),linear-gradient(135deg,#fff9ef_0%,#ead8c9_34%,#d4b7a8_70%,#a99580_100%)]" />
      <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-[#f7efe4]/45 blur-3xl" />
      <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-[#d59ab0]/24 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7b8f68]/22 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(44,33,27,0.18)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.13] bg-[linear-gradient(90deg,rgba(71,52,43,0.16)_1px,transparent_1px),linear-gradient(rgba(71,52,43,0.13)_1px,transparent_1px)] bg-[size:38px_38px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2.25rem] border border-white/55 bg-[#fffaf4]/50 shadow-[0_34px_100px_rgba(55,38,31,0.22)] backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden min-h-[720px] overflow-hidden border-r border-white/25 bg-[#263b2b] p-9 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.18)_0,transparent_22%),radial-gradient(circle_at_88%_18%,rgba(181,151,124,0.26)_0,transparent_20%),linear-gradient(145deg,#41543b_0%,#263b2b_44%,#1b291e_100%)]" />
            <div className="absolute -right-16 top-12 h-48 w-48 rounded-full border border-white/15 bg-white/5" />
            <div className="absolute -bottom-16 left-10 h-44 w-44 rotate-12 rounded-[2rem] border border-white/15 bg-white/5" />
            <div className="absolute left-8 top-1/2 h-px w-28 bg-white/20" />
            <div className="relative">
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
                Greatest Invention Yet
              </p>
              <h2 className="max-w-sm text-6xl font-semibold leading-[0.9] tracking-[-0.03em]">
                Your private digital sanctuary.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-7 text-white/72">
                A calm room for reflections, moods, plans, memories, and the
                quieter version of you that is becoming.
              </p>
            </div>

            <div className="relative grid gap-3">
              <div className="w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/75 shadow-[0_18px_44px_rgba(0,0,0,0.14)]">
                private by design
              </div>
              <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 text-sm leading-6 text-white/76 shadow-[0_18px_44px_rgba(0,0,0,0.16)] backdrop-blur">
                Start with an account. Leave with a space that feels like a
                room of your own.
              </div>
            </div>
          </section>

          <section className="relative p-5 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute right-6 top-6 hidden h-20 w-20 rounded-full border border-[#7b5d4c]/10 sm:block" />
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#816254]">
              Begin gently
            </p>
            <h1 className="max-w-md text-4xl font-semibold leading-[0.95] tracking-[-0.025em] text-[#352820] sm:text-5xl">
              Create your account
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#69564b]">
              Start building your private space for reflection, planning, and
              becoming.
            </p>

            <div className="mt-7 flex flex-col gap-3.5">
              <label className="group flex cursor-pointer items-center gap-4 rounded-[1.75rem] border border-white/70 bg-white/42 p-4 shadow-[inset_0_1px_12px_rgba(66,46,36,0.045),0_16px_42px_rgba(70,48,38,0.08)] backdrop-blur transition hover:bg-white/58">
                <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/90 bg-[#f1e3d8] shadow-[0_16px_34px_rgba(72,52,42,0.14)] ring-4 ring-[#efe1d4]/70 transition group-hover:ring-[#dce7d2]">
                  {profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePicture}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7468]">
                      Add photo
                    </span>
                  )}
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-[#425f45]">
                    Add a profile photo
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#7b675b]">
                    Optional, expressive, and saved privately on this device.
                  </span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="sr-only"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className={inputClassName}
                />

                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className={inputClassName}
                />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={inputClassName}
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={inputClassName}
              />

              <div>
                <label className={labelClassName}>Enter your birthday</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <section className="rounded-[1.5rem] border border-[#ded0c5] bg-[#fffaf4]/82 p-4 text-sm text-[#604f46] shadow-[inset_0_1px_10px_rgba(66,46,36,0.04)]">
                <p className={labelClassName}>Terms + Privacy</p>

                <label className="mb-3 flex gap-3 rounded-[1.25rem] border border-[#e4d7cc] bg-white/58 p-3">
                  <input
                    type="checkbox"
                    checked={acceptedAgreement}
                    onChange={(e) => setAcceptedAgreement(e.target.checked)}
                    className="mt-1 accent-[#4e6350]"
                  />
                  <span className="leading-6">
                    I have read and agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={legalLinkClassName}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={legalLinkClassName}
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                <label className="mb-2 block text-sm font-semibold text-[#59483f]">
                  Signature
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Type your full name"
                  className={inputClassName}
                />

                <p className="mt-3 rounded-full bg-white/72 px-4 py-2 text-xs text-[#756257]">
                  Agreement date: {getPrettyDate(agreementDate)}
                </p>
              </section>

              {errorMessage && (
                <p className="rounded-[1.25rem] border border-[#e4d7cc] bg-white/80 p-4 text-sm text-[#7d3f32]">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                onClick={handleSignup}
                disabled={!canCreateAccount}
                className="mt-1 rounded-full bg-[linear-gradient(135deg,#2f4432_0%,#5f764f_100%)] py-3.5 text-center text-sm font-semibold text-white shadow-[0_18px_38px_rgba(47,68,50,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(47,68,50,0.32)] disabled:cursor-not-allowed disabled:bg-[#cbbdb3] disabled:bg-none disabled:text-white/80 disabled:shadow-none disabled:hover:translate-y-0"
              >
                Create account
              </button>

              <p className="text-center text-sm text-[#756257]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#4e6350] underline decoration-[#b8c7aa] underline-offset-4 transition hover:text-[#2f4432]"
                >
                  Log in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
